from enum import Enum

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

from trolley_drive.kinematics import cmd_vel_to_wheel_rpm

from SalonPath import (
    Bus,
    UDPTransport,
    SalonPath,
    ControlType,
)


# =========================
# Robot constants
# =========================

WHEEL_RADIUS = 0.075       # m
TRACK_WIDTH = 0.431        # m

# Motor IDs
LEFT_MOTOR_ID = 1
RIGHT_MOTOR_ID = 2

# ESP32のIP / UDPポート
ESP32_IP = "192.168.1.50"
ESP32_PORT = 5000

# Motor command frequency
CONTROL_FREQUENCY = 50.0   # Hz


class DriveMode(Enum):
    TELEOP = 0
    AUTO = 1


class TrolleyDrive(Node):

    def __init__(self):
        super().__init__('trolley_drive')

        # =========================
        # Mode
        # =========================

        self.mode = DriveMode.TELEOP

        # =========================
        # Target wheel RPM
        # =========================

        self.left_rpm = 0.0
        self.right_rpm = 0.0

        # =========================
        # SalonPath
        # =========================

        transport = UDPTransport(
            host=ESP32_IP,
            port=ESP32_PORT,
            debug=True,
        )

        self.bus = Bus(transport)

        self.left_motor = SalonPath(
            self.bus,
            LEFT_MOTOR_ID,
        )

        self.right_motor = SalonPath(
            self.bus,
            RIGHT_MOTOR_ID,
        )

        # =========================
        # /cmd_vel
        # =========================

        self.cmd_vel_sub = self.create_subscription(
            Twist,
            '/cmd_vel',
            self.cmd_vel_callback,
            10,
        )

        # =========================
        # Motor control loop
        # =========================

        control_period = 1.0 / CONTROL_FREQUENCY

        self.control_timer = self.create_timer(
            control_period,
            self.control_loop,
        )

        self.get_logger().info(
            'Trolley Drive started: TELEOP mode'
        )

    # =========================
    # TELEOP
    # =========================

    def cmd_vel_callback(self, msg: Twist):

        if self.mode != DriveMode.TELEOP:
            return

        linear_velocity = msg.linear.x
        angular_velocity = msg.angular.z

        self.left_rpm, self.right_rpm = (
            cmd_vel_to_wheel_rpm(
                linear_velocity,
                angular_velocity,
                WHEEL_RADIUS,
                TRACK_WIDTH,
            )
        )

    # =========================
    # Motor control loop
    # =========================

    def control_loop(self):

        if self.mode == DriveMode.TELEOP:

            self.left_motor.setReference(
                self.left_rpm,
                ControlType.VELOCITY,
            )

            self.right_motor.setReference(
                self.right_rpm,
                ControlType.VELOCITY,
            )

        elif self.mode == DriveMode.AUTO:

            # TODO:
            # Auto用のServiceから受け取った
            # 左右RPMをここで送る
            pass

    # =========================
    # Stop motors
    # =========================

    def stop_motors(self):

        self.left_motor.setReference(
            0.0,
            ControlType.DISABLE,
        )

        self.right_motor.setReference(
            0.0,
            ControlType.DISABLE,
        )

    # =========================
    # Shutdown
    # =========================

    def destroy_node(self):

        self.stop_motors()

        self.bus.close()

        super().destroy_node()


def main(args=None):

    rclpy.init(args=args)

    node = TrolleyDrive()

    try:
        rclpy.spin(node)

    except KeyboardInterrupt:
        pass

    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()