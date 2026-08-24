import math


def cmd_vel_to_wheel_rpm(
    linear_velocity: float,
    angular_velocity: float,
    wheel_radius: float,
    track_width: float,
) -> tuple[float, float]:
    """
    cmd_velのlinear.x / angular.zから
    左右車輪のRPMを計算する。

    Args:
        linear_velocity: 前進速度 [m/s]
        angular_velocity: 角速度 [rad/s]
        wheel_radius: 車輪半径 [m]
        track_width: 左右車輪間距離 [m]

    Returns:
        (left_rpm, right_rpm)
    """

    left_velocity = (
        linear_velocity
        - angular_velocity * track_width / 2.0
    )

    right_velocity = (
        linear_velocity
        + angular_velocity * track_width / 2.0
    )

    left_rpm = (
        left_velocity
        / (2.0 * math.pi * wheel_radius)
        * 60.0
    )

    right_rpm = (
        right_velocity
        / (2.0 * math.pi * wheel_radius)
        * 60.0
    )

    return left_rpm, right_rpm