"""
Switchコントローラの /joy を Twist へ変換するノード。

`/joy` の受信ごとに publish するのではなく、`publish_rate` の
タイマーで publish する。

理由:
    以前は `joy_callback` の中で毎回 publish していたため、
    joyドライバが出すレートがそのまま下流（cmd_vel_mux →
    trolley_drive）へ流れていた。Joy-Conはスティックのノイズや
    IMU由来のイベントで数百Hz級の `/joy` を出すことがあり、
    その分だけ下流のコールバックとDDSトラフィックが増えて
    操作遅延の原因になっていた。

    スマートフォン側（trolley_api）はブラウザ・ROSブリッジとも
    20Hzで制限されているのに、Joy側だけ無制限という
    非対称な構成になっていた。

`/joy` が途絶した場合は `joy_timeout` を過ぎたところで publish を
やめる。cmd_vel_mux 側の「Joy途絶」判定に任せるためで、
ここでゼロを publish し続けてしまうと mux から見て Joy が
生きているように見え、スマートフォンへ操作権が移らなくなる。
"""

import time

import rclpy
from rclpy.node import Node
from rclpy.qos import (
    DurabilityPolicy,
    HistoryPolicy,
    QoSProfile,
    ReliabilityPolicy,
)

from sensor_msgs.msg import Joy
from geometry_msgs.msg import Twist


# ============================================================
# Defaults
# ============================================================

# /cmd_vel の出力レート [Hz]
# cmd_vel_mux / trolley_drive と同じ50Hzに揃えている。
DEFAULT_PUBLISH_RATE = 50.0

# /joy を途絶と見なすまでの時間 [s]
#
# ここを過ぎると publish を止め、cmd_vel_mux の joy_timeout に
# 引き継ぐ。両者の合計が「操作権がスマートフォンへ移るまでの
# 時間」になるので、launch側でまとめて調整する。
DEFAULT_JOY_TIMEOUT = 0.5

DEFAULT_LINEAR_SPEED = 1.0
DEFAULT_ANGULAR_SPEED = 1.0

# 軸・ボタンの割り当て
#
# 既定値は従来のハードコードと同じ。Joy-Conは持ち方（縦持ち /
# 横持ち）でスティックの軸が90度回るため、実機に合わせて
# launch や --ros-args で上書きできるようにしている。
DEFAULT_LINEAR_AXIS = 0
DEFAULT_ANGULAR_AXIS = 1

# angular側の符号。従来の `-horizontal * angular_speed` に相当。
DEFAULT_ANGULAR_SCALE = -1.0

# デッドマン（押している間だけ動く）ボタン
DEFAULT_DEADMAN_BUTTON = 2


# ============================================================
# QoS
# ============================================================

# 速度指令・joy入力ともに「最新値だけが意味を持つ」データなので
# 履歴は1件だけ持つ。既定の depth=10 だと、下流が一瞬止まった
# 際に古い指令が溜まり、復帰後にそれを順番に実行してしまう。
LATEST_QOS = QoSProfile(
    depth=1,
    history=HistoryPolicy.KEEP_LAST,
    reliability=ReliabilityPolicy.RELIABLE,
    durability=DurabilityPolicy.VOLATILE,
)


class JoyTeleop(Node):

    def __init__(self):
        super().__init__('joy_teleop')

        # =========================
        # Parameters
        # =========================

        self.declare_parameter('publish_rate', DEFAULT_PUBLISH_RATE)
        self.declare_parameter('joy_timeout', DEFAULT_JOY_TIMEOUT)
        self.declare_parameter('linear_speed', DEFAULT_LINEAR_SPEED)
        self.declare_parameter('angular_speed', DEFAULT_ANGULAR_SPEED)
        self.declare_parameter('linear_axis', DEFAULT_LINEAR_AXIS)
        self.declare_parameter('angular_axis', DEFAULT_ANGULAR_AXIS)
        self.declare_parameter('angular_scale', DEFAULT_ANGULAR_SCALE)
        self.declare_parameter(
            'deadman_button',
            DEFAULT_DEADMAN_BUTTON,
        )

        publish_rate = self._positive_param(
            'publish_rate',
            DEFAULT_PUBLISH_RATE,
        )

        self.joy_timeout = self._positive_param(
            'joy_timeout',
            DEFAULT_JOY_TIMEOUT,
        )

        self.linear_speed = float(
            self.get_parameter('linear_speed').value
        )
        self.angular_speed = float(
            self.get_parameter('angular_speed').value
        )
        self.angular_scale = float(
            self.get_parameter('angular_scale').value
        )

        self.linear_axis = int(
            self.get_parameter('linear_axis').value
        )
        self.angular_axis = int(
            self.get_parameter('angular_axis').value
        )
        self.deadman_button = int(
            self.get_parameter('deadman_button').value
        )

        # =========================
        # 最新のjoy入力
        # =========================

        self._last_joy = None
        self._last_joy_stamp = None
        self._joy_stale = False

        # =========================
        # Communication
        # =========================

        self.subscription = self.create_subscription(
            Joy,
            '/joy',
            self.joy_callback,
            LATEST_QOS,
        )

        self.publisher = self.create_publisher(
            Twist,
            '/cmd_vel',
            LATEST_QOS,
        )

        # =========================
        # Timer
        # =========================

        self.publish_timer = self.create_timer(
            1.0 / publish_rate,
            self.publish_command,
        )

        self.get_logger().info(
            f'Joy Teleop started: '
            f'publish_rate={publish_rate}Hz, '
            f'joy_timeout={self.joy_timeout}s, '
            f'linear_axis={self.linear_axis}, '
            f'angular_axis={self.angular_axis}, '
            f'deadman_button={self.deadman_button}'
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
    # Joy input
    # =========================

    def joy_callback(self, msg: Joy):
        """最新のjoy入力を保持するだけ。publishはタイマーが行う。"""
        self._last_joy = msg
        self._last_joy_stamp = time.monotonic()

    # =========================
    # Output
    # =========================

    def publish_command(self):
        """joyが生きている間だけ /cmd_vel を出力する。"""
        if self._last_joy is None:
            # まだ一度も受信していない
            return

        elapsed = time.monotonic() - self._last_joy_stamp

        if elapsed > self.joy_timeout:
            # 途絶。ここでゼロを publish し続けると mux から見て
            # Joy が生きているように見えてしまうため、
            # publish 自体を止めて mux の判定に任せる。
            if not self._joy_stale:
                self._joy_stale = True

                self.get_logger().warn(
                    f'/joy stale for {elapsed:.2f}s, '
                    f'stopped publishing /cmd_vel'
                )

            return

        if self._joy_stale:
            self._joy_stale = False
            self.get_logger().info('/joy recovered')

        self.publisher.publish(self._compute_twist(self._last_joy))

    def _compute_twist(self, msg: Joy) -> Twist:
        """joy入力をTwistへ変換する。"""
        # デッドマンボタンを押していなければ停止
        if len(msg.buttons) <= self.deadman_button:
            self.get_logger().warn(
                f'joy has {len(msg.buttons)} buttons, '
                f'deadman_button={self.deadman_button} is out of range',
                throttle_duration_sec=5.0,
            )
            return Twist()

        if not msg.buttons[self.deadman_button]:
            return Twist()

        required_axes = max(self.linear_axis, self.angular_axis) + 1

        if len(msg.axes) < required_axes:
            self.get_logger().warn(
                f'joy has {len(msg.axes)} axes, '
                f'but {required_axes} are required',
                throttle_duration_sec=5.0,
            )
            return Twist()

        vertical = msg.axes[self.linear_axis]
        horizontal = msg.axes[self.angular_axis]

        twist = Twist()

        # 大きく倒した方向だけを採用
        if abs(vertical) >= abs(horizontal):
            # 前後のみ
            twist.linear.x = vertical * self.linear_speed
            twist.angular.z = 0.0

        else:
            # 回転のみ
            twist.linear.x = 0.0
            twist.angular.z = (
                horizontal
                * self.angular_scale
                * self.angular_speed
            )

        return twist

    def publish_zero(self):
        self.publisher.publish(Twist())


def main(args=None):
    rclpy.init(args=args)

    node = JoyTeleop()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass

    node.publish_zero()
    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
