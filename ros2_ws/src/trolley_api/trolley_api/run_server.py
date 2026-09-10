"""
ros2 launch から API サーバを起動するためのエントリポイント。

launch から起動すると ROS 引数（--ros-args）が渡されるため、
uvicorn のCLIをそのまま使うと引数解析でエラーになる。
このモジュールは自前の引数だけを解釈し、
残りは rclpy（api_server 内の rclpy.init）に任せる。

待ち受けは2本ある。

  - HTTP  (既定 8000): 操作画面 `/controller/` と API。
    WebSocket を `ws://` で張るため、ここは HTTPS にできない。
  - HTTPS (既定 8443): 床タグ検出ページ。
    カメラを使うので secure context が必須。

詳しくは detector_server.py の冒頭を参照。

従来どおり手動で起動する方法も引き続き使える
（その場合 HTTPS 側は上がらないので、必要なら
 `ros2 run trolley_api detector_server` を併用する）。

    uvicorn trolley_api.api_server:app --host 0.0.0.0 --port 8000
"""

import argparse
import logging
import os

import uvicorn

from trolley_api import detector_server


# ============================================================
# Configuration
# ============================================================

DEFAULT_HOST = '0.0.0.0'
DEFAULT_PORT = 8000

APP_PATH = 'trolley_api.api_server:app'


# ============================================================
# Arguments
# ============================================================

TRUE_WORDS = ('1', 'true', 'yes', 'on')
FALSE_WORDS = ('0', 'false', 'no', 'off')


def _env_int(name: str, fallback: int) -> int:
    """環境変数をintとして読む。未設定・異常値はfallbackを使う。"""
    raw = os.environ.get(name)

    if raw is None:
        return fallback

    try:
        return int(raw)
    except ValueError:
        return fallback


def _parse_bool(raw: str) -> bool:
    """'true' / 'false' などを真偽値にする。"""
    value = str(raw).strip().lower()

    if value in TRUE_WORDS:
        return True

    if value in FALSE_WORDS:
        return False

    raise argparse.ArgumentTypeError(
        f'真偽値として解釈できません: {raw!r}'
    )


def _env_bool(name: str, fallback: bool) -> bool:
    """環境変数を真偽値として読む。未設定・異常値はfallbackを使う。"""
    raw = os.environ.get(name)

    if raw is None:
        return fallback

    try:
        return _parse_bool(raw)
    except argparse.ArgumentTypeError:
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

    # 床タグ検出ページ。カメラを使うので HTTPS が必須で、
    # 操作画面と同じポートには相乗りできない
    # （理由は detector_server.py の冒頭を参照）。
    parser.add_argument(
        '--detector-port',
        type=int,
        default=_env_int(
            'TROLLEY_DETECTOR_PORT',
            detector_server.DEFAULT_PORT,
        ),
        help='床タグ検出ページ (HTTPS) の待ち受けポート',
    )

    # launch の LaunchConfiguration は 'true' / 'false' という文字列に
    # なるので、store_true ではなく値を取る形にしてそのまま渡せるようにする。
    parser.add_argument(
        '--detector',
        type=_parse_bool,
        nargs='?',
        const=True,
        default=_env_bool('TROLLEY_DETECTOR_ENABLED', True),
        metavar='true|false',
        help='床タグ検出ページを配信するか（既定: true）',
    )

    parser.add_argument(
        '--cert-dir',
        default=None,
        help='検出ページ用の自己署名証明書の置き場所',
    )

    # --ros-args 以降は rclpy が解釈するのでここでは捨てる
    args, _ = parser.parse_known_args()

    return args


def main():
    """APIサーバを起動する。"""
    args = parse_args()

    # detector_server の起動ログ（URLと証明書の指紋）を出すため。
    # uvicorn の dictConfig は disable_existing_loggers=False なので、
    # ここで root に付けたハンドラはこの後も生き残る。
    logging.basicConfig(
        level=logging.INFO,
        format='[%(levelname)s] [%(name)s]: %(message)s',
    )

    # HTTPS の待ち受けを別スレッドで先に上げる。
    # 失敗しても None が返るだけで、操作画面と走行には影響しない。
    if args.detector:
        detector_server.start_in_thread(
            host=args.host,
            port=args.detector_port,
            cert_dir=args.cert_dir,
        )

    uvicorn.run(
        APP_PATH,
        host=args.host,
        port=args.port,
        log_level='info',
    )


if __name__ == '__main__':
    main()
