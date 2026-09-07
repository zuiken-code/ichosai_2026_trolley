from fastapi import FastAPI
import rclpy
from rclpy.node import Node

from trolley_interfaces.srv import (
    SetDriveEnabled,
    SetDriveMode,
)


app = FastAPI()


class ROSClient(Node):

    def __init__(self):
        super().__init__('trolley_api')

        self.enable_client = self.create_client(
            SetDriveEnabled,
            '/drive/set_enabled',
        )

        self.mode_client = self.create_client(
            SetDriveMode,
            '/drive/set_mode',
        )

        self.get_logger().info(
            'Waiting for drive services...'
        )

        self.enable_client.wait_for_service()
        self.mode_client.wait_for_service()

        self.get_logger().info(
            'Drive services connected'
        )


rclpy.init()
ros_node = ROSClient()


@app.get('/api/status')
def status():
    return {
        'enabled': None,
        'mode': None,
    }


@app.post('/api/enable')
def set_enable(enabled: bool):

    request = SetDriveEnabled.Request()
    request.enabled = enabled

    future = ros_node.enable_client.call_async(request)

    rclpy.spin_until_future_complete(
        ros_node,
        future,
    )

    response = future.result()

    return {
        'success': response.success,
        'message': response.message,
    }


@app.post('/api/mode')
def set_mode(mode: str):

    if mode == 'teleop':
        mode_value = 1

    elif mode == 'auto':
        mode_value = 2

    else:
        return {
            'success': False,
            'message': 'Invalid mode',
        }

    request = SetDriveMode.Request()
    request.mode = mode_value

    future = ros_node.mode_client.call_async(request)

    rclpy.spin_until_future_complete(
        ros_node,
        future,
    )

    response = future.result()

    return {
        'success': response.success,
        'message': response.message,
    }