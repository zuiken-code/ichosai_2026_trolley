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

# Duty 100% 相当のモーター最大RPM
#
# TODO:
# 実機でDuty=1.0を出したときのRPMを測定して変更する。
MAX_RPM = 127

# Motor IDs
LEFT_MOTOR_ID = 1
RIGHT_MOTOR_ID = 2

# ESP32のIP / UDPポート
ESP32_IP = "192.168.0.116"
ESP32_PORT = 5000

# Motor command frequency
CONTROL_FREQUENCY = 50.0   # Hz


# =========================
# Drive Mode
# =========================

class DriveMode(Enum):
    TELEOP = 1
    AUTO = 2


# =========================
# Utility
# =========================

def rpm_to_duty(rpm: float) -> float:
    """
    RPMをDuty [-1.0, +1.0] に変換する。

    例:
        +MAX_RPM -> +1.0
        +MAX_RPM/2 -> +0.5
        0 -> 0.0
        -MAX_RPM/2 -> -0.5
        -MAX_RPM -> -1.0
    """

    duty = rpm / MAX_RPM

    # ESP32側の仕様に合わせて
    # -1.0 ～ +1.0 に制限
    return max(-1.0, min(1.0, duty))


# =========================
# Trolley Drive Node
# =========================

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
        # Target motor Duty
        #
        # -1.0 ～ +1.0
        # =========================

        self.left_duty = 0.0
        self.right_duty = 0.0

        # =========================
        # SalonPath
        # =========================

        transport = UDPTransport(
            host=ESP32_IP,
            port=ESP32_PORT,
            debug=False,

            # 送信エラーはROSのログへ流す。
            # UDPTransport側で同一エラーは間引かれるため、
            # ESP32が落ちてもログが溢れない。
            logger=self.get_logger(),
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

        # TELEOP以外ではcmd_velを無視
        if self.mode != DriveMode.TELEOP:
            return

        linear_velocity = msg.linear.x
        angular_velocity = msg.angular.z

        # =========================
        # cmd_vel -> wheel RPM
        # =========================

        self.left_rpm, self.right_rpm = (
            cmd_vel_to_wheel_rpm(
                linear_velocity,
                angular_velocity,
                WHEEL_RADIUS,
                TRACK_WIDTH,
            )
        )

        # =========================
        # RPM -> Duty
        # =========================

        self.left_duty = rpm_to_duty(
            self.left_rpm
        )

        self.right_duty = rpm_to_duty(
            self.right_rpm
        )

        # =========================
        # Debug
        # =========================
        #
        # ここは /cmd_vel の受信ごとに呼ばれるホットパスなので、
        # print(flush=True) は使わない。
        # launch の output='screen' 経由だと1行ごとにパイプへの
        # write() が走り、詰まると購読コールバックごと停止して
        # 操作遅延の原因になる。
        #
        # 見たいときは以下で有効化する。
        #   ros2 run trolley_drive drive_node --ros-args \
        #       --log-level trolley_drive:=debug

        self.get_logger().debug(
            f"cmd_vel linear={linear_velocity:.3f} "
            f"angular={angular_velocity:.3f} "
            f"rpm=({self.left_rpm:.2f}, {self.right_rpm:.2f}) "
            f"duty=({self.left_duty:.3f}, {self.right_duty:.3f})"
        )

    # =========================
    # Enable / Disable
    # =========================

    def set_enabled_callback(
        self,
        request,
        response,
    ):

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

    def set_mode_callback(
        self,
        request,
        response,
    ):

        if request.mode == DriveMode.TELEOP.value:

            self.mode = DriveMode.TELEOP

        elif request.mode == DriveMode.AUTO.value:

            self.mode = DriveMode.AUTO

        else:

            response.success = False
            response.message = (
                f'Invalid mode: {request.mode}'
            )

            self.get_logger().warn(
                response.message
            )

            return response

        response.success = True
        response.message = (
            f'Mode changed to {self.mode.name}'
        )

        self.get_logger().info(
            response.message
        )

        return response

    # =========================
    # Motor Control Loop
    # =========================

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

            # =========================
            # Duty Output
            # =========================

            self.left_motor.setReference(
                    self.left_duty,
                ControlType.DUTY_CYCLE,
            )

            self.right_motor.setReference(
                -self.right_duty,
                ControlType.DUTY_CYCLE,
            )

        # =========================
        # AUTO
        # =========================

        elif self.mode == DriveMode.AUTO:

            # TODO:
            #
            # Auto用Serviceなどから左右RPMを受け取り、
            # ここでRPM -> Dutyへ変換して送る。
            #
            # 例:
            #
            # left_duty = rpm_to_duty(auto_left_rpm)
            # right_duty = rpm_to_duty(auto_right_rpm)
            #
            # self.left_motor.setReference(
            #     left_duty,
            #     ControlType.DUTY_CYCLE,
            # )
            #
            # self.right_motor.setReference(
            #     right_duty,
            #     ControlType.DUTY_CYCLE,
            # )

            pass

    # =========================
    # Stop motors
    # =========================

    def stop_motors(self):

        # 内部の目標値も0に戻す
        self.left_rpm = 0.0
        self.right_rpm = 0.0

        self.left_duty = 0.0
        self.right_duty = 0.0

        # ESP32側のDISABLEを使用
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


# =========================
# Main
# =========================

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
