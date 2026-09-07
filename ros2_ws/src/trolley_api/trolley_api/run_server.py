"""
ros2 launch から API サーバを起動するためのエントリポイント。

launch から起動すると ROS 引数（--ros-args）が渡されるため、
uvicorn のCLIをそのまま使うと引数解析でエラーになる。
このモジュールは自前の引数だけを解釈し、
残りは rclpy（api_server 内の rclpy.init）に任せる。

従来どおり手動で起動する方法も引き続き使える。

    uvicorn trolley_api.api_server:app --host 0.0.0.0 --port 8000
"""

import argparse
import os

import uvicorn


# ============================================================
# Configuration
# ============================================================

DEFAULT_HOST = '0.0.0.0'
DEFAULT_PORT = 8000

APP_PATH = 'trolley_api.api_server:app'


# ============================================================
# Arguments
# ============================================================

def _env_int(name: str, fallback: int) -> int:
    """環境変数をintとして読む。未設定・異常値はfallbackを使う。"""
    raw = os.environ.get(name)

    if raw is None:
        return fallback

    try:
        return int(raw)
    except ValueError:
        return fallback


def parse_args():
    """自前の引数だけを解釈する。ROS引数は無視する。"""
    parser = argparse.ArgumentParser(
        description='Trolley API server',
    )

    parser.add_argument(
        '--host',
        default=os.environ.get('TROLLEY_API_HOST', DEFAULT_HOST),
        help='待ち受けアドレス',
    )

    parser.add_argument(
        '--port',
        type=int,
        default=_env_int('TROLLEY_API_PORT', DEFAULT_PORT),
        help='待ち受けポート',
    )

    # --ros-args 以降は rclpy が解釈するのでここでは捨てる
    args, _ = parser.parse_known_args()

    return args


def main():
    """APIサーバを起動する。"""
    args = parse_args()

    uvicorn.run(
        APP_PATH,
        host=args.host,
        port=args.port,
        log_level='info',
    )


if __name__ == '__main__':
    main()
