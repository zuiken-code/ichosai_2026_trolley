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

    with_detector = LaunchConfiguration('with_detector')
    detector_port = LaunchConfiguration('detector_port')

    phone_max_linear = LaunchConfiguration('phone_max_linear')
    phone_max_angular = LaunchConfiguration('phone_max_angular')

    joy_timeout = LaunchConfiguration('joy_timeout')
    joy_stale_timeout = LaunchConfiguration('joy_stale_timeout')
    joy_publish_rate = LaunchConfiguration('joy_publish_rate')

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

        # 床タグ検出ページは、操作画面とは別にHTTPSで配る。
        # カメラを使うにはsecure contextが必要で、操作画面側は
        # ws:// を張る都合でHTTPSにできないため、同じポートに
        # 相乗りできない（detector_server.py の冒頭を参照）。
        DeclareLaunchArgument(
            'with_detector',
            default_value='true',
            description='床タグ検出ページ（HTTPS）を配信するか',
        ),

        DeclareLaunchArgument(
            'detector_port',
            default_value='8443',
            description='床タグ検出ページの待ち受けポート',
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

        # Joy途絶からスマートフォンへ操作権が移るまでの時間は
        #
        #     joy_stale_timeout  (joy_teleop が publish を止めるまで)
        #   + joy_timeout        (cmd_vel_mux が途絶と判定するまで)
        #
        # の合計になる。従来は joy_teleop 側に途絶判定が無く
        # cmd_vel_mux の 1.0s だけだったので、合計を揃えるために
        # 0.5s + 0.5s にしている。
        DeclareLaunchArgument(
            'joy_timeout',
            default_value='0.5',
            description=(
                'cmd_vel_muxがJoyを途絶と見なすまでの時間 [s]'
            ),
        ),

        DeclareLaunchArgument(
            'joy_stale_timeout',
            default_value='0.5',
            description=(
                'joy_teleopが/joyを途絶と見なして'
                '/cmd_vel/joyの出力を止めるまでの時間 [s]'
            ),
        ),

        DeclareLaunchArgument(
            'joy_publish_rate',
            default_value='50.0',
            description='joy_teleopが/cmd_vel/joyを出力するレート [Hz]',
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
                # /joy が止まり、joy_teleop と cmd_vel_mux が
                # 「Joy途絶」と誤判定してしまう。
                #
                # joy_teleop 側の joy_stale_timeout (既定0.5s) より
                # 十分速いレートにしておく必要がある。
                'autorepeat_rate': 20.0,
                'deadzone': 0.05,
            }],
        ),

        # joy_teleop の出力先を /cmd_vel/joy へ差し替える
        Node(
            package='joy_teleop',
            executable='joy_teleop',
            name='joy_teleop',
            output='screen',
            parameters=[{
                # /joy の受信レートではなく、このレートで
                # /cmd_vel/joy を出力する。joyドライバが出す
                # レートがそのまま下流へ流れるのを防ぐため。
                'publish_rate': ParameterValue(
                    joy_publish_rate,
                    value_type=float,
                ),
                'joy_timeout': ParameterValue(
                    joy_stale_timeout,
                    value_type=float,
                ),

                # 軸・ボタンの割り当て。
                # Joy-Conは持ち方でスティックの軸が90度回るため、
                # 実機に合わせてここで調整する。
                # `ros2 topic echo /joy` で確認できる。
                'linear_axis': 0,
                'angular_axis': 1,
                'angular_scale': -1.0,
                'deadman_button': 2,
            }],
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
                        '--detector', with_detector,
                        '--detector-port', detector_port,
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
