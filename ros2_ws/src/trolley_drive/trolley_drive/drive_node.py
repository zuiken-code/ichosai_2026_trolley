from enum import Enum

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from trolley_interfaces.srv import SetDriveEnabled, SetDriveMode

from trolley_drive.kinematics import cmd_vel_to_wheel_rpm

from SalonPath import (
    MotorBus,
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
ESP32_IP = "192.168.1.116"
ESP32_PORT = 5000

# Motor command frequency
CONTROL_FREQUENCY = 50.0   # Hz


class DriveMode(Enum):
    TELEOP = 1
    AUTO = 2


class TrolleyDrive(Node):

    def __init__(self):
        super().__init__('trolley_drive')

        # =========================
        # Mode
        # =========================
        self.enabled = False
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

        self.bus = MotorBus(transport)

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
        # Drive control services
        # =========================

        self.enable_service = self.create_service(
            SetDriveEnabled,
            '/drive/set_enabled',
            self.set_enabled_callback,
        )

        self.mode_service = self.create_service(
            SetDriveMode,
            '/drive/set_mode',
            self.set_mode_callback,
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
        
        # print(
        #     f"[CMD_VEL] "
        #     f"linear={linear_velocity:.3f}, "
        #     f"angular={angular_velocity:.3f}, "
        #     f"left_rpm={self.left_rpm:.2f}, "
        #     f"right_rpm={self.right_rpm:.2f}",
        #     flush=True,
        #     )
        
    # =========================
    # Enable / Disable
    # =========================

    def set_enabled_callback(self, request, response):

        self.enabled = request.enabled

        if self.enabled:
            response.success = True
            response.message = 'Drive enabled'

            self.get_logger().info(
                'Drive enabled'
            )

        else:
            self.stop_motors()

            response.success = True
            response.message = 'Drive disabled'

            self.get_logger().info(
                'Drive disabled'
            )

        return response

    # =========================
    # TELEOP / AUTO
    # =========================

    def set_mode_callback(self, request, response):

        if request.mode == DriveMode.TELEOP.value:

            self.mode = DriveMode.TELEOP

        elif request.mode == DriveMode.AUTO.value:

            self.mode = DriveMode.AUTO

        else:

            response.success = False
            response.message = f'Invalid mode: {request.mode}'

            self.get_logger().warn(
                response.message
            )

            return response

        response.success = True
        response.message = f'Mode changed to {self.mode.name}'

        self.get_logger().info(
            response.message
        )

        return response

    def control_loop(self):

        # =========================
        # Disabled
        # =========================

        if not self.enabled:
            self.stop_motors()
            return

        # =========================
        # TELEOP
        # =========================

        if self.mode == DriveMode.TELEOP:

            self.left_motor.setReference(
                self.left_rpm,
                ControlType.VELOCITY,
            )

            self.right_motor.setReference(
                self.right_rpm,
                ControlType.VELOCITY,
            )

        # =========================
        # AUTO
        # =========================

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