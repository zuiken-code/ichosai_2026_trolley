from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription([
        Node(
            package='joy',
            executable='joy_node',
            name='joy',
            output='screen',
        ),

        Node(
            package='joy_teleop',
            executable='joy_teleop',
            name='joy_teleop',
            output='screen',
        ),
        Node(
        package='trolley_drive',
        executable='drive_node',
        name='trolley_drive',
        output='screen',
        ),
        Node(
             package='trolley_api',
             executable='api_server',
             name='trolley_api',
             output='screen',
         ), 
    ])
