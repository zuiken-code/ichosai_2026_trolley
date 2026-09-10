"""
スマートフォンをコントローラにするためのWebSocketブリッジ。

Switchコントローラの接続不良時のバックアップとして使う。

  ブラウザ --WebSocket--> /ws/teleop --> /cmd_vel/phone --> cmd_vel_mux

操作権の調停は cmd_vel_mux ノードが行う。
このモジュールは以下だけを担当する。

  * WebSocketで受けた正規化済み入力を Twist に変換して publish する
  * 入力が途絶したらゼロ速度を publish する
  * 操作権の要求／返却を cmd_vel_mux のServiceへ中継する
  * cmd_vel_mux の状態をブラウザへ配信する

trolley_interfaces を変更せずに済ませるため、
状態は std_msgs/String に載ったJSONとして受け取り、
操作権の要求／返却には std_srvs/Trigger を使う。
"""

import asyncio
import json
import math
import os
import threading
import time
from pathlib import Path

import rclpy
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from geometry_msgs.msg import Twist
from rcl_interfaces.msg import SetParametersResult
from rclpy.executors import SingleThreadedExecutor
from rclpy.node import Node
from rclpy.qos import (
    DurabilityPolicy,
    HistoryPolicy,
    QoSProfile,
    ReliabilityPolicy,
)
from std_msgs.msg import String
from std_srvs.srv import Trigger


# ============================================================
# Configuration
# ============================================================

PHONE_CMD_TOPIC = '/cmd_vel/phone'
STATUS_TOPIC = '/teleop/status'

REQUEST_PHONE_SERVICE = '/teleop/request_phone'
RELEASE_TO_JOY_SERVICE = '/teleop/release_to_joy'

NODE_NAME = 'trolley_phone_teleop'

# 既定値。launchのparametersでも環境変数でも上書きできる。
DEFAULT_MAX_LINEAR = 1.0
DEFAULT_MAX_ANGULAR = 1.0
DEFAULT_PUBLISH_RATE = 20.0
DEFAULT_COMMAND_TIMEOUT = 0.3

# ブラウザへ状態を送る間隔 [s]
STATE_PUSH_PERIOD = 0.2

# 速度指令用のQoS
#
# 速度指令は「最新値だけが意味を持つ」データなので履歴は1件だけ持つ。
# 既定の depth=10 だと、下流のノードが一瞬止まった際に古い指令が
# 溜まり、復帰後にそれを順番に実行してしまう。
# cmd_vel_mux / trolley_drive 側と同じ設定にしておく必要がある。
CMD_VEL_QOS = QoSProfile(
    depth=1,
    history=HistoryPolicy.KEEP_LAST,
    reliability=ReliabilityPolicy.RELIABLE,
    durability=DurabilityPolicy.VOLATILE,
)

# スティックの入力上限
INPUT_LIMIT = 1.0


# ============================================================
# Helpers
# ============================================================

def _env_float(name: str, fallback: float) -> float:
    """環境変数をfloatとして読む。未設定・異常値はfallbackを使う。"""
    raw = os.environ.get(name)

    if raw is None:
        return fallback

    try:
        value = float(raw)
    except ValueError:
        return fallback

    if not math.isfinite(value) or value <= 0.0:
        return fallback

    return value


def _env_bool(name: str, fallback: bool) -> bool:
    """環境変数を真偽値として読む。"""
    raw = os.environ.get(name)

    if raw is None:
        return fallback

    return raw.strip().lower() in ('1', 'true', 'yes', 'on')


def _clamp_input(value) -> float:
    """スティック入力を [-1.0, 1.0] に収める。異常値は0にする。"""
    try:
        value = float(value)
    except (TypeError, ValueError):
        return 0.0

    if not math.isfinite(value):
        return 0.0

    return max(-INPUT_LIMIT, min(INPUT_LIMIT, value))


def resolve_web_dir() -> Path:
    """
    スマートフォン向け画面の配置場所を返す。

    colcon install済みならshare配下を、
    ソースツリーから直接起動している場合はリポジトリ内を使う。
    """
    try:
        from ament_index_python.packages import get_package_share_directory

        candidate = Path(get_package_share_directory('trolley_api')) / 'web'

        if (candidate / 'index.html').is_file():
            return candidate

    except Exception:
        # ament_index が使えない環境ではソースツリーを探す
        pass

    return Path(__file__).resolve().parent.parent / 'web'


WEB_DIR = resolve_web_dir()


# ============================================================
# ROS node
# ============================================================

class PhoneTeleopNode(Node):
    """スマートフォンの入力を /cmd_vel/phone へ流すノード。"""

    def __init__(self):
        """パラメータ・通信・タイマーを準備する。"""
        super().__init__(NODE_NAME)

        # =========================
        # Parameters
        # =========================

        self.declare_parameter(
            'max_linear',
            _env_float('TROLLEY_PHONE_MAX_LINEAR', DEFAULT_MAX_LINEAR),
        )

        self.declare_parameter(
            'max_angular',
            _env_float('TROLLEY_PHONE_MAX_ANGULAR', DEFAULT_MAX_ANGULAR),
        )

        self.declare_parameter(
            'invert_angular',
            _env_bool('TROLLEY_PHONE_INVERT_ANGULAR', False),
        )

        self.declare_parameter(
            'publish_rate',
            _env_float('TROLLEY_PHONE_PUBLISH_RATE', DEFAULT_PUBLISH_RATE),
        )

        self.declare_parameter(
            'command_timeout',
            _env_float(
                'TROLLEY_PHONE_COMMAND_TIMEOUT',
                DEFAULT_COMMAND_TIMEOUT,
            ),
        )

        self.max_linear = float(self.get_parameter('max_linear').value)
        self.max_angular = float(self.get_parameter('max_angular').value)
        self.invert_angular = bool(
            self.get_parameter('invert_angular').value
        )
        self.command_timeout = float(
            self.get_parameter('command_timeout').value
        )

        publish_rate = float(self.get_parameter('publish_rate').value)

        if publish_rate <= 0.0:
            publish_rate = DEFAULT_PUBLISH_RATE

        self.add_on_set_parameters_callback(self._on_set_parameters)

        # =========================
        # 入力状態
        # =========================

        self._lock = threading.Lock()

        self._linear_input = 0.0
        self._angular_input = 0.0
        self._input_stamp = None
        self._driver_connected = False

        self._status = None
        self._status_stamp = None

        # =========================
        # Publisher
        # =========================

        self.cmd_pub = self.create_publisher(
            Twist,
            PHONE_CMD_TOPIC,
            CMD_VEL_QOS,
        )

        # =========================
        # Subscription
        # =========================

        status_qos = QoSProfile(
            depth=1,
            history=HistoryPolicy.KEEP_LAST,
            durability=DurabilityPolicy.TRANSIENT_LOCAL,
        )

        self.status_sub = self.create_subscription(
            String,
            STATUS_TOPIC,
            self._status_callback,
            status_qos,
        )

        # =========================
        # Service clients
        # =========================

        self.request_phone_client = self.create_client(
            Trigger,
            REQUEST_PHONE_SERVICE,
        )

        self.release_to_joy_client = self.create_client(
            Trigger,
            RELEASE_TO_JOY_SERVICE,
        )

        # =========================
        # Timer
        # =========================

        self.publish_timer = self.create_timer(
            1.0 / publish_rate,
            self._publish_command,
        )

        self.get_logger().info(
            f'phone teleop bridge started: '
            f'max_linear={self.max_linear}, '
            f'max_angular={self.max_angular}'
        )

    # =========================
    # Parameters
    # =========================

    def _on_set_parameters(self, parameters):
        """実行中のパラメータ変更を反映する。"""
        for parameter in parameters:
            if parameter.name == 'max_linear':
                self.max_linear = float(parameter.value)

            elif parameter.name == 'max_angular':
                self.max_angular = float(parameter.value)

            elif parameter.name == 'invert_angular':
                self.invert_angular = bool(parameter.value)

            elif parameter.name == 'command_timeout':
                value = float(parameter.value)

                if value <= 0.0:
                    return SetParametersResult(
                        successful=False,
                        reason='command_timeout must be positive',
                    )

                self.command_timeout = value

        return SetParametersResult(successful=True)

    # =========================
    # Status
    # =========================

    def _status_callback(self, msg: String):
        """cmd_vel_mux の状態を受け取る。"""
        try:
            status = json.loads(msg.data)
        except ValueError:
            self.get_logger().warn(
                f'invalid status payload: {msg.data!r}'
            )
            return

        with self._lock:
            self._status = status
            self._status_stamp = time.monotonic()

    def get_status(self):
        """cmd_vel_mux の最新状態を返す。未受信ならNone。"""
        with self._lock:
            if self._status is None:
                return None

            return dict(self._status)

    # =========================
    # 入力
    # =========================

    def set_driver_connected(self, connected: bool):
        """
        操作端末が接続されているかを設定する。

        接続されていない間は publish を止める。
        cmd_vel_mux 側でスマホが途絶したと判定され、
        Joyが生きていれば自動でJoyへ操作権が戻る。
        """
        with self._lock:
            self._driver_connected = connected

            if not connected:
                self._linear_input = 0.0
                self._angular_input = 0.0
                self._input_stamp = None

    def set_input(self, linear: float, angular: float):
        """正規化済みのスティック入力を保持する。"""
        with self._lock:
            self._linear_input = _clamp_input(linear)
            self._angular_input = _clamp_input(angular)
            self._input_stamp = time.monotonic()

    def clear_input(self):
        """入力をゼロに戻す（指を離したときなど）。"""
        with self._lock:
            self._linear_input = 0.0
            self._angular_input = 0.0
            self._input_stamp = time.monotonic()

    def _publish_command(self):
        """保持している入力を Twist にして publish する。"""
        with self._lock:
            if not self._driver_connected:
                return

            stamp = self._input_stamp
            linear_input = self._linear_input
            angular_input = self._angular_input
            timeout = self.command_timeout

        twist = Twist()

        stale = stamp is None or (time.monotonic() - stamp) > timeout

        if not stale:
            twist.linear.x = linear_input * self.max_linear

            angular = angular_input * self.max_angular

            if self.invert_angular:
                angular = -angular

            twist.angular.z = angular

        self.cmd_pub.publish(twist)

    # =========================
    # 操作権
    # =========================

    def request_phone(self):
        """
        スマートフォンへの操作権移譲を要求する。

        応答待ちでイベントループを止めないよう、
        結果は /teleop/status の更新で確認する。

        Returns:
            (受付できたか, メッセージ)
        """
        return self._call_trigger(
            self.request_phone_client,
            REQUEST_PHONE_SERVICE,
        )

    def release_to_joy(self):
        """
        Joyへの操作権返却を要求する。

        Returns:
            (受付できたか, メッセージ)
        """
        return self._call_trigger(
            self.release_to_joy_client,
            RELEASE_TO_JOY_SERVICE,
        )

    def _call_trigger(self, client, service_name: str):
        """Trigger Serviceを応答待ちなしで呼ぶ。"""
        if not client.service_is_ready():
            message = (
                f'{service_name} が利用できません。'
                f'cmd_vel_mux が起動しているか確認してください。'
            )

            self.get_logger().warn(message)

            return False, message

        client.call_async(Trigger.Request())

        return True, '要求を送信しました'


# ============================================================
# Bridge (ROS実行スレッド)
# ============================================================

class TeleopBridge:
    """PhoneTeleopNode を専用スレッドで回す。"""

    def __init__(self):
        """ノードとExecutorを起動する。"""
        if not rclpy.ok():
            rclpy.init()

        self.node = PhoneTeleopNode()

        self._executor = SingleThreadedExecutor()
        self._executor.add_node(self.node)

        self._stopping = False

        self._thread = threading.Thread(
            target=self._spin,
            name='phone-teleop-executor',
            daemon=True,
        )

        self._thread.start()

    def _spin(self):
        """Executorを回す。停止処理中の例外は無視する。"""
        try:
            self._executor.spin()

        except Exception:
            if not self._stopping:
                raise

    def shutdown(self):
        """Executorとノードを片付ける。"""
        self._stopping = True

        try:
            self.node.set_driver_connected(False)
            self._executor.shutdown(timeout_sec=1.0)
            self._executor.remove_node(self.node)
            self.node.destroy_node()

        except Exception:
            pass


_bridge = None
_bridge_lock = threading.Lock()


def get_bridge() -> TeleopBridge:
    """ブリッジを取得する（初回呼び出しで起動）。"""
    global _bridge

    with _bridge_lock:
        if _bridge is None:
            _bridge = TeleopBridge()

        return _bridge


def shutdown_bridge():
    """ブリッジを停止する。"""
    global _bridge

    with _bridge_lock:
        if _bridge is not None:
            _bridge.shutdown()
            _bridge = None


# ============================================================
# WebSocket セッション管理
# ============================================================

class Session:
    """WebSocket 1接続分の状態。"""

    def __init__(self, session_id: int, websocket: WebSocket):
        """セッションを初期化する。"""
        self.id = session_id
        self.websocket = websocket
        self.is_driver = False


class SessionRegistry:
    """接続中のセッションと操作端末を管理する。"""

    def __init__(self):
        """レジストリを初期化する。"""
        self._sessions = []
        self._next_id = 1

    def add(self, websocket: WebSocket) -> Session:
        """セッションを登録する。最初の接続が操作端末になる。"""
        session = Session(self._next_id, websocket)
        self._next_id += 1

        self._sessions.append(session)

        if self.driver is None:
            session.is_driver = True

        return session

    def remove(self, session: Session):
        """
        セッションを解除する。

        操作端末が抜けた場合は、残っている接続のうち
        最も古いものを操作端末に昇格させる。
        こうしておくと、cmd_vel_mux から見た
        「スマホが生きている」状態が途切れない。
        """
        if session in self._sessions:
            self._sessions.remove(session)

        session.is_driver = False

        if self.driver is None and self._sessions:
            self._sessions[0].is_driver = True

    def set_driver(self, session: Session):
        """指定セッションを操作端末にする。"""
        for other in self._sessions:
            other.is_driver = other is session

    @property
    def driver(self):
        """現在の操作端末。無ければNone。"""
        for session in self._sessions:
            if session.is_driver:
                return session

        return None

    @property
    def sessions(self):
        """接続中のセッション一覧。"""
        return list(self._sessions)

    def __len__(self):
        """接続数を返す。"""
        return len(self._sessions)


_registry = SessionRegistry()


# ============================================================
# 状態の組み立て
# ============================================================

def build_state(session: Session = None) -> dict:
    """ブラウザへ送る状態を組み立てる。"""
    bridge = get_bridge()
    status = bridge.node.get_status()

    state = {
        't': 'state',
        'clients': len(_registry),
        'driver': bool(session.is_driver) if session else False,
        'mux_available': status is not None,
        'source': status.get('source') if status else None,
        'joy_alive': bool(status.get('joy_alive')) if status else False,
        'phone_alive': bool(status.get('phone_alive')) if status else False,
        'return_pending': (
            bool(status.get('return_pending')) if status else False
        ),
    }

    return state


async def _send_json(websocket: WebSocket, payload: dict):
    """JSONを送る。切断済みなら黙って諦める。"""
    try:
        await websocket.send_text(json.dumps(payload))

    except Exception:
        pass


async def _push_state_loop(session: Session):
    """状態が変わったらブラウザへ送り続ける。"""
    previous = None

    try:
        while True:
            state = build_state(session)

            if state != previous:
                previous = state
                await _send_json(session.websocket, state)

            await asyncio.sleep(STATE_PUSH_PERIOD)

    except asyncio.CancelledError:
        raise


# ============================================================
# メッセージ処理
# ============================================================

async def _handle_message(session: Session, raw: str):
    """ブラウザからの1メッセージを処理する。"""
    bridge = get_bridge()

    try:
        message = json.loads(raw)
    except ValueError:
        return

    if not isinstance(message, dict):
        return

    kind = message.get('t')

    if kind == 'cmd':
        # 操作端末以外の入力は無視する
        if not session.is_driver:
            return

        bridge.node.set_input(
            message.get('lx', 0.0),
            message.get('az', 0.0),
        )

    elif kind == 'stop':
        if session.is_driver:
            bridge.node.clear_input()

    elif kind == 'ping':
        await _send_json(
            session.websocket,
            {'t': 'pong', 'ts': message.get('ts')},
        )

    elif kind == 'claim':
        _registry.set_driver(session)
        bridge.node.clear_input()

        accepted, text = bridge.node.request_phone()

        await _send_json(
            session.websocket,
            {
                't': 'notice',
                'level': 'info' if accepted else 'warn',
                'message': text,
            },
        )

    elif kind == 'release':
        accepted, text = bridge.node.release_to_joy()

        if accepted:
            bridge.node.clear_input()

        await _send_json(
            session.websocket,
            {
                't': 'notice',
                'level': 'info' if accepted else 'warn',
                'message': text,
            },
        )


# ============================================================
# FastAPI router
# ============================================================

router = APIRouter()


@router.get('/api/teleop/status')
def get_teleop_status():
    """操作権の状態をHTTPで取得する（デバッグ用）。"""
    bridge = get_bridge()
    status = bridge.node.get_status()

    return {
        'clients': len(_registry),
        'has_driver': _registry.driver is not None,
        'mux_available': status is not None,
        'mux': status,
        'limits': {
            'max_linear': bridge.node.max_linear,
            'max_angular': bridge.node.max_angular,
        },
    }


@router.websocket('/ws/teleop')
async def teleop_socket(websocket: WebSocket):
    """スマートフォンコントローラとのWebSocket接続を処理する。"""
    bridge = get_bridge()

    await websocket.accept()

    session = _registry.add(websocket)
    bridge.node.clear_input()
    bridge.node.set_driver_connected(_registry.driver is not None)

    await _send_json(
        websocket,
        {
            't': 'hello',
            'driver': session.is_driver,
            'limits': {
                'max_linear': bridge.node.max_linear,
                'max_angular': bridge.node.max_angular,
            },
        },
    )

    await _send_json(websocket, build_state(session))

    pusher = asyncio.create_task(_push_state_loop(session))

    try:
        while True:
            raw = await websocket.receive_text()
            await _handle_message(session, raw)

    except WebSocketDisconnect:
        pass

    except Exception as error:
        bridge.node.get_logger().warn(
            f'websocket session {session.id} aborted: {error}'
        )

    finally:
        pusher.cancel()

        was_driver = session.is_driver
        _registry.remove(session)

        if was_driver:
            # 操作端末が抜けたので、まず停止させる
            bridge.node.clear_input()

        bridge.node.set_driver_connected(_registry.driver is not None)
