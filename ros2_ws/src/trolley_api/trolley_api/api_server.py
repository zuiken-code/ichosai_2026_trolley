from contextlib import asynccontextmanager

import rclpy
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from rclpy.node import Node

from trolley_api.teleop_ws import (
    WEB_DIR,
    get_bridge,
    router as teleop_router,
    shutdown_bridge,
)

from trolley_interfaces.srv import (
    SetDriveEnabled,
    SetDriveMode,
)


# ============================================================
# Configuration
# ============================================================

ENABLE_SERVICE = '/drive/set_enabled'
MODE_SERVICE = '/drive/set_mode'

MODE_TELEOP = 1
MODE_AUTO = 2


# ============================================================
# ROS Client
# ============================================================

class ROSClient(Node):

    def __init__(self):
        super().__init__('trolley_api')

        self.enable_client = self.create_client(
            SetDriveEnabled,
            ENABLE_SERVICE,
        )

        self.mode_client = self.create_client(
            SetDriveMode,
            MODE_SERVICE,
        )

        self.get_logger().info(
            'Waiting for drive services...'
        )

        if not self.enable_client.wait_for_service(
            timeout_sec=5.0
        ):
            raise RuntimeError(
                f'{ENABLE_SERVICE} is not available'
            )

        if not self.mode_client.wait_for_service(
            timeout_sec=5.0
        ):
            raise RuntimeError(
                f'{MODE_SERVICE} is not available'
            )

        self.get_logger().info(
            'Drive services connected'
        )


# ============================================================
# ROS initialization
# ============================================================

rclpy.init()
ros_node = ROSClient()


# ============================================================
# FastAPI lifecycle
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    # スマートフォンコントローラ用のROSブリッジを起動する
    get_bridge()

    yield

    shutdown_bridge()

    ros_node.destroy_node()
    rclpy.shutdown()


# ============================================================
# FastAPI
# ============================================================

app = FastAPI(
    title='Trolley API',
    description='API for controlling the trolley',
    version='1.0.0',
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    # 開発中は "*" でOK。
    # 本番ではGitHub Pages / VercelのURLに限定する。
    allow_origins=[
        '*',
    ],

    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)


# ============================================================
# スマートフォンコントローラ
# ============================================================

# WebSocket (/ws/teleop) と状態取得API
app.include_router(teleop_router)

# スマートフォン向けの操作画面。
# 同一オリジンのhttpで配信することで、
# httpsのページから ws://192.168.x.x へ接続できない
# mixed contentの問題を避ける。
if WEB_DIR.is_dir():
    app.mount(
        '/controller',
        StaticFiles(directory=WEB_DIR, html=True),
        name='controller',
    )


# ============================================================
# API
# ============================================================

@app.get('/api/status')
def get_status():
    """
    現在の状態を取得する。

    TODO:
        ROS側に状態取得Serviceを追加したら、
        enabled / mode を実際の値に変更する。
    """

    return {
        'enabled': None,
        'mode': None,
    }


@app.post('/api/enable')
def set_enable(enabled: bool):
    """
    Drive enable / disable
    """

    request = SetDriveEnabled.Request()
    request.enabled = enabled

    future = ros_node.enable_client.call_async(request)

    try:
        rclpy.spin_until_future_complete(
            ros_node,
            future,
            timeout_sec=3.0,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'ROS error: {e}',
        )

    if not future.done():
        raise HTTPException(
            status_code=504,
            detail='ROS service timeout',
        )

    response = future.result()

    if response is None:
        raise HTTPException(
            status_code=500,
            detail='ROS service returned no response',
        )

    return {
        'success': response.success,
        'message': response.message,
    }


@app.post('/api/mode')
def set_mode(mode: str):
    """
    Drive modeを変更する。

    mode:
        teleop
        auto
    """

    mode = mode.lower()

    if mode == 'teleop':
        mode_value = MODE_TELEOP

    elif mode == 'auto':
        mode_value = MODE_AUTO

    else:
        raise HTTPException(
            status_code=400,
            detail='Invalid mode. Use "teleop" or "auto".',
        )

    request = SetDriveMode.Request()
    request.mode = mode_value

    future = ros_node.mode_client.call_async(request)

    try:
        rclpy.spin_until_future_complete(
            ros_node,
            future,
            timeout_sec=3.0,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'ROS error: {e}',
        )

    if not future.done():
        raise HTTPException(
            status_code=504,
            detail='ROS service timeout',
        )

    response = future.result()

    if response is None:
        raise HTTPException(
            status_code=500,
            detail='ROS service returned no response',
        )

    return {
        'success': response.success,
        'message': response.message,
    }

# ============================================================
# 起動
# ============================================================

# ここには main() を置かない。
#
# 以前は待ち受け先を決め打ちした main() があり、console_scripts が
# それを指していたため、launch の api_host / api_port が黙って
# 無視されていた。起動時の引数を解釈するのは run_server.py の役目で、
# HTTPS の検出ページもそちらが一緒に立てる。
#
#   ros2 run trolley_api api_server --host 0.0.0.0 --port 8000
#
# uvicorn のCLIから直接使うこともできる（この場合HTTPSは立たない）。
#
#   uvicorn trolley_api.api_server:app --host 0.0.0.0 --port 8000
