"""
`trolley_phone.launch.py` への薄いエイリアス。

    ros2 launch trolley_bringup trolley.launch.py

以前はこのファイルが joy_node / joy_teleop / trolley_drive /
api_server を直接起動していたが、2つの問題があった。

1. cmd_vel_mux を経由しないため速度指令のウォッチドッグが無く、
   joy_teleop が落ちたりJoy-ConのBluetoothが切れても
   trolley_drive が最後に受け取った指令を保持したまま走り続けた。
   （trolley_drive 自体は /cmd_vel の途絶を判定していない）

2. joy_node にパラメータを渡していなかったため、
   autorepeat_rate / deadzone がドライバ既定のままだった。
   スティックを倒し続けている間に /joy が止まったり、
   逆にノイズで高レートになったりする。

3. api_server を待ち時間なしで起動していたため、
   drive_node のServiceを5秒以内に見つけられず
   RuntimeError で落ちることがあった。
   （trolley_phone.launch.py 側は TimerAction で5秒待つ）

構成を1系統に統一するため、ここでは trolley_phone.launch.py を
そのまま include する。Switchコントローラのみの構成にしたい場合は

    ros2 launch trolley_bringup trolley.launch.py with_api:=false

とすれば、joy_node / joy_teleop / cmd_vel_mux / trolley_drive の
4ノード構成になる（ウォッチドッグは有効なまま）。
"""

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare


TARGET_LAUNCH_FILE = 'trolley_phone.launch.py'


# 転送する引数の一覧。
#
# 既定値は trolley_phone.launch.py 側と一致させる必要がある。
# 引数を追加・変更するときは両方を直すこと。
# （launchの引数は include 先へ自動では伝播しないため、
#   ここで宣言して明示的に渡している）
FORWARDED_ARGUMENTS = (
    (
        'with_api',
        'true',
        'APIサーバ（スマートフォン用画面）を起動するか',
    ),
    (
        'api_host',
        '0.0.0.0',
        'APIサーバの待ち受けアドレス',
    ),
    (
        'api_port',
        '8000',
        'APIサーバの待ち受けポート',
    ),
    (
        'phone_max_linear',
        '1.0',
        'スマートフォン操作時の最大並進速度 [m/s]',
    ),
    (
        'phone_max_angular',
        '1.0',
        'スマートフォン操作時の最大角速度 [rad/s]',
    ),
    (
        'joy_timeout',
        '0.5',
        'cmd_vel_muxがJoyを途絶と見なすまでの時間 [s]',
    ),
    (
        'joy_stale_timeout',
        '0.5',
        'joy_teleopが/joyを途絶と見なすまでの時間 [s]',
    ),
    (
        'joy_publish_rate',
        '50.0',
        'joy_teleopが/cmd_vel/joyを出力するレート [Hz]',
    ),
)


def generate_launch_description():
    """trolley_phone.launch.py を引数ごと include する。"""
    declarations = [
        DeclareLaunchArgument(
            name,
            default_value=default_value,
            description=description,
        )
        for name, default_value, description in FORWARDED_ARGUMENTS
    ]

    target = PathJoinSubstitution([
        FindPackageShare('trolley_bringup'),
        'launch',
        TARGET_LAUNCH_FILE,
    ])

    include = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(target),
        launch_arguments=[
            (name, LaunchConfiguration(name))
            for name, _, _ in FORWARDED_ARGUMENTS
        ],
    )

    return LaunchDescription([*declarations, include])
