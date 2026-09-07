"""
Switchコントローラ＋スマートフォンコントローラ構成の起動ファイル。

    ros2 launch trolley_bringup trolley_phone.launch.py

既存の trolley.launch.py は変更していないため、
従来どおりSwitchコントローラだけの構成でも起動できる。

構成:

    joy_node --> /joy --> joy_teleop --> /cmd_vel/joy ---+
                                                         +--> cmd_vel_mux
    ブラウザ --WebSocket--> trolley_api --> /cmd_vel/phone +
                                                         |
                                             /cmd_vel <--+ --> trolley_drive
"""

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, TimerAction
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue


def generate_launch_description():
    """ノード一式を起動する。"""
    with_api = LaunchConfiguration('with_api')
    api_host = LaunchConfiguration('api_host')
    api_port = LaunchConfiguration('api_port')

    phone_max_linear = LaunchConfiguration('phone_max_linear')
    phone_max_angular = LaunchConfiguration('phone_max_angular')

    joy_timeout = LaunchConfiguration('joy_timeout')

    return LaunchDescription([

        # =========================
        # Launch arguments
        # =========================

        DeclareLaunchArgument(
            'with_api',
            default_value='true',
            description='APIサーバ（スマートフォン用画面）を起動するか',
        ),

        DeclareLaunchArgument(
            'api_host',
            default_value='0.0.0.0',
            description='APIサーバの待ち受けアドレス',
        ),

        DeclareLaunchArgument(
            'api_port',
            default_value='8000',
            description='APIサーバの待ち受けポート',
        ),

        DeclareLaunchArgument(
            'phone_max_linear',
            default_value='1.0',
            description='スマートフォン操作時の最大並進速度 [m/s]',
        ),

        DeclareLaunchArgument(
            'phone_max_angular',
            default_value='1.0',
            description='スマートフォン操作時の最大角速度 [rad/s]',
        ),

        DeclareLaunchArgument(
            'joy_timeout',
            default_value='1.0',
            description='Joyを途絶と見なすまでの時間 [s]',
        ),

        # =========================
        # Switchコントローラ
        # =========================

        Node(
            package='joy',
            executable='joy_node',
            name='joy',
            output='screen',
            parameters=[{
                # 入力に変化が無くても publish させる。
                # これが無いと、スティックを倒し続けている間に
                # /joy が止まり、cmd_vel_mux が「Joy途絶」と
                # 誤判定してしまう。
                'autorepeat_rate': 20.0,
                'deadzone': 0.05,
            }],
        ),

        # joy_teleop のコードは変更せず、出力先だけ差し替える
        Node(
            package='joy_teleop',
            executable='joy_teleop',
            name='joy_teleop',
            output='screen',
            remappings=[
                ('/cmd_vel', '/cmd_vel/joy'),
            ],
        ),

        # =========================
        # 操作権の調停
        # =========================

        Node(
            package='trolley_cmd_mux',
            executable='cmd_vel_mux',
            name='cmd_vel_mux',
            output='screen',
            parameters=[{
                'joy_timeout': ParameterValue(
                    joy_timeout,
                    value_type=float,
                ),
                'phone_timeout': 0.5,
                'phone_lost_timeout': 2.0,
                'auto_return_on_phone_loss': True,
                'publish_rate': 50.0,
                'status_rate': 5.0,
            }],
        ),

        # =========================
        # 駆動
        # =========================

        Node(
            package='trolley_drive',
            executable='drive_node',
            name='trolley_drive',
            output='screen',
        ),

        # =========================
        # APIサーバ + スマートフォン用画面
        # =========================

        # trolley_api は起動時に drive_node のServiceを待つため、
        # drive_node が立ち上がるのを待ってから起動する。
        TimerAction(
            period=5.0,
            actions=[
                Node(
                    package='trolley_api',
                    executable='api_server',
                    output='screen',
                    condition=IfCondition(with_api),
                    arguments=[
                        '--host', api_host,
                        '--port', api_port,
                    ],
                    # このプロセスは trolley_api と
                    # trolley_phone_teleop の2ノードを持つ。
                    # name を指定するとパラメータが片方にしか
                    # 届かないため、あえて指定していない。
                    # （launch_ros が /** 宛てに書き出すため、
                    #   trolley_phone_teleop にも適用される）
                    parameters=[{
                        'max_linear': ParameterValue(
                            phone_max_linear,
                            value_type=float,
                        ),
                        'max_angular': ParameterValue(
                            phone_max_angular,
                            value_type=float,
                        ),
                    }],
                ),
            ],
        ),
    ])
