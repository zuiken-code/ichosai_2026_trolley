import rclpy
from rclpy.node import Node

from sensor_msgs.msg import Joy
from geometry_msgs.msg import Twist


class JoyTeleop(Node):

    def __init__(self):
        super().__init__('joy_teleop')

        self.subscription = self.create_subscription(
            Joy,
            '/joy',
            self.joy_callback,
            10
        )

        self.publisher = self.create_publisher(
            Twist,
            '/cmd_vel',
            10
        )

        self.linear_speed = 1.0
        self.angular_speed = 1.0

        self.get_logger().info('Joy Teleop started')

    def joy_callback(self, msg: Joy):

        # Aボタンが押されていなければ停止
        if len(msg.buttons) <= 2 or msg.buttons[2] == 0:
            self.publish_zero()
            return

        if len(msg.axes) <= 1:
            self.publish_zero()
            return

        vertical = msg.axes[0]
        horizontal = msg.axes[1]

        twist = Twist()

        # 大きく倒した方向だけを採用
        if abs(vertical) >= abs(horizontal):
            # 前後のみ
            twist.linear.x = vertical * self.linear_speed
            twist.angular.z = 0.0

        else:
            # 回転のみ
            twist.linear.x = 0.0
            twist.angular.z = -horizontal * self.angular_speed

        self.publisher.publish(twist)

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