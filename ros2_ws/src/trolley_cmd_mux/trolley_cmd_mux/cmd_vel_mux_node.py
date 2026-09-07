"""
Joy(Switchコントローラ) とスマートフォンの /cmd_vel を調停するノード。

  /cmd_vel/joy   ---+
                    +--> cmd_vel_mux --> /cmd_vel
  /cmd_vel/phone ---+

trolley_drive は最後に受け取った速度を保持し続けるため、
操作権を持つ入力が途絶した場合はゼロ速度を送り続ける必要がある。
そのためこのノードは publish_rate で常時 /cmd_vel を出力する。
"""

import json
import time

import rclpy
from geometry_msgs.msg import Twist
from rclpy.node import Node
from rclpy.qos import DurabilityPolicy, HistoryPolicy, QoSProfile
from std_msgs.msg import String
from std_srvs.srv import Trigger

from trolley_cmd_mux.arbiter import SourceArbiter, TeleopSource


# ============================================================
# Configuration
# ============================================================

JOY_CMD_TOPIC = '/cmd_vel/joy'
PHONE_CMD_TOPIC = '/cmd_vel/phone'
OUTPUT_TOPIC = '/cmd_vel'
STATUS_TOPIC = '/teleop/status'

REQUEST_PHONE_SERVICE = '/teleop/request_phone'
RELEASE_TO_JOY_SERVICE = '/teleop/release_to_joy'


# ============================================================
# Node
# ============================================================

class CmdVelMux(Node):
    """操作権を調停して /cmd_vel を出力するノード。"""

    def __init__(self):
        """パラメータ・通信・タイマーを準備する。"""
        super().__init__('cmd_vel_mux')

        # =========================
        # Parameters
        # =========================

        self.declare_parameter('joy_timeout', 1.0)
        self.declare_parameter('phone_timeout', 0.5)
        self.declare_parameter('phone_lost_timeout', 2.0)
        self.declare_parameter('auto_return_on_phone_loss', True)
        self.declare_parameter('publish_rate', 50.0)
        self.declare_parameter('status_rate', 5.0)

        publish_rate = self._positive_param('publish_rate', 50.0)
        status_rate = self._positive_param('status_rate', 5.0)

        self.arbiter = SourceArbiter(
            joy_timeout=self._positive_param('joy_timeout', 1.0),
            phone_timeout=self._positive_param('phone_timeout', 0.5),
            phone_lost_timeout=self._positive_param(
                'phone_lost_timeout',
                2.0,
            ),
            auto_return_on_phone_loss=bool(
                self.get_parameter('auto_return_on_phone_loss').value
            ),
        )

        # =========================
        # 最新のコマンド
        # =========================

        self.joy_cmd = Twist()
        self.phone_cmd = Twist()

        self._last_source = self.arbiter.source

        # =========================
        # Subscriptions
        # =========================

        self.joy_sub = self.create_subscription(
            Twist,
            JOY_CMD_TOPIC,
            self.joy_cmd_callback,
            10,
        )

        self.phone_sub = self.create_subscription(
            Twist,
            PHONE_CMD_TOPIC,
            self.phone_cmd_callback,
            10,
        )

        # =========================
        # Publishers
        # =========================

        self.cmd_pub = self.create_publisher(
            Twist,
            OUTPUT_TOPIC,
            10,
        )

        # 後から購読したUIにも最新状態が届くようlatchする
        status_qos = QoSProfile(
            depth=1,
            history=HistoryPolicy.KEEP_LAST,
            durability=DurabilityPolicy.TRANSIENT_LOCAL,
        )

        self.status_pub = self.create_publisher(
            String,
            STATUS_TOPIC,
            status_qos,
        )

        # =========================
        # Services
        # =========================

        self.request_phone_service = self.create_service(
            Trigger,
            REQUEST_PHONE_SERVICE,
            self.request_phone_callback,
        )

        self.release_to_joy_service = self.create_service(
            Trigger,
            RELEASE_TO_JOY_SERVICE,
            self.release_to_joy_callback,
        )

        # =========================
        # Timers
        # =========================

        self.control_timer = self.create_timer(
            1.0 / publish_rate,
            self.control_loop,
        )

        self.status_timer = self.create_timer(
            1.0 / status_rate,
            self.publish_status,
        )

        self.publish_status()

        self.get_logger().info(
            'cmd_vel_mux started: JOY has control'
        )

    # =========================
    # Parameter helper
    # =========================

    def _positive_param(self, name: str, fallback: float) -> float:
        """パラメータを正のfloatとして読む。異常値はfallbackを使う。"""
        value = self.get_parameter(name).value

        try:
            value = float(value)
        except (TypeError, ValueError):
            value = fallback

        if value <= 0.0:
            self.get_logger().warn(
                f'{name} must be positive, using {fallback}'
            )
            value = fallback

        return value

    # =========================
    # Command callbacks
    # =========================

    def joy_cmd_callback(self, msg: Twist):
        """Joy由来のコマンドを保持する。"""
        self.joy_cmd = msg
        self.arbiter.notify_joy(time.monotonic())

    def phone_cmd_callback(self, msg: Twist):
        """スマートフォン由来のコマンドを保持する。"""
        self.phone_cmd = msg
        self.arbiter.notify_phone(time.monotonic())

    # =========================
    # Services
    # =========================

    def request_phone_callback(self, request, response):
        """スマートフォンへの操作権移譲要求に応答する。"""
        del request

        success, message = self.arbiter.request_phone(
            time.monotonic()
        )

        response.success = success
        response.message = message

        self._log_service_result(success, message)
        self.publish_status()

        return response

    def release_to_joy_callback(self, request, response):
        """Joyへの操作権返却要求に応答する。"""
        del request

        success, message = self.arbiter.release_to_joy(
            time.monotonic()
        )

        response.success = success
        response.message = message

        self._log_service_result(success, message)
        self.publish_status()

        return response

    def _log_service_result(self, success: bool, message: str):
        """サービス処理の結果をログに出す。"""
        if success:
            self.get_logger().info(message)
        else:
            self.get_logger().warn(message)

    # =========================
    # Control loop
    # =========================

    def control_loop(self):
        """操作権を更新し、/cmd_vel を出力する。"""
        now = time.monotonic()
        source = self.arbiter.update(now)

        if source != self._last_source:
            self.get_logger().warn(
                f'control source changed: {self._last_source.value}'
                f' -> {source.value} ({self.arbiter.reason})'
            )

            self._last_source = source
            self.publish_status()

        if not self.arbiter.is_active_source_alive(now):
            # 操作権を持つ入力が途絶しているので停止させる
            self.cmd_pub.publish(Twist())
            return

        if source == TeleopSource.JOY:
            self.cmd_pub.publish(self.joy_cmd)
        else:
            self.cmd_pub.publish(self.phone_cmd)

    # =========================
    # Status
    # =========================

    def publish_status(self):
        """
        現在の状態を /teleop/status へ publish する。

        trolley_interfaces に手を入れずに済ませるため、
        std_msgs/String にJSONを載せて配信している。
        """
        state = self.arbiter.state(time.monotonic())

        message = String()
        message.data = json.dumps(state, sort_keys=True)

        self.status_pub.publish(message)

    # =========================
    # Shutdown
    # =========================

    def destroy_node(self):
        """停止指令を出してからノードを破棄する。"""
        self.cmd_pub.publish(Twist())

        super().destroy_node()


def main(args=None):
    """ノードを起動する。"""
    rclpy.init(args=args)

    node = CmdVelMux()

    try:
        rclpy.spin(node)

    except KeyboardInterrupt:
        pass

    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
