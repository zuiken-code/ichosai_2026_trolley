"""床タグ検出ページを HTTPS で配る、静的ファイル専用のサーバ。

なぜ操作画面 (`/controller/`) と同じポートに相乗りさせないのか:

  - カメラ (`getUserMedia`) は secure context でしか使えないので、
    検出ページは HTTPS でなければならない。
  - 一方で操作画面は `ws://` で WebSocket を張るため、HTTPS にすると
    mixed content で接続できなくなる（api_server.py のコメント参照）。

つまり同一ポートでは両立しない。そこで API サーバのプロセスの中に、
HTTPS の待ち受けをもう1本だけ足している。

検出ページはこのサーバと通信しない。効果音はスマートフォンの中で
完結するので、ここはファイルを配るだけで、ROS にも依存しない。
"""

from __future__ import annotations

import contextlib
import logging
import os
import threading
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles


# ============================================================
# Configuration
# ============================================================

DEFAULT_PORT = 8443

# 証明書の置き場所。install空間は colcon build のたびに作り直されるので、
# ビルドしても消えない場所に置く。
DEFAULT_CERT_DIR = '~/.local/state/trolley_api/certs'

logger = logging.getLogger('trolley_api.detector')


# ============================================================
# Paths
# ============================================================

def resolve_detector_dir() -> Path:
    """検出ページのディレクトリを返す。

    インストール済みなら share/trolley_api/web_detector を使う。
    ソースツリーから直接起動している場合はリポジトリ内を使う。
    """
    try:
        from ament_index_python.packages import get_package_share_directory

        candidate = (
            Path(get_package_share_directory('trolley_api')) / 'web_detector'
        )

        if (candidate / 'index.html').is_file():
            return candidate

    except Exception:
        # ament_index が使えない環境ではソースツリーを探す
        pass

    return Path(__file__).resolve().parent.parent / 'web_detector'


def resolve_cert_dir(raw: str | None = None) -> Path:
    """証明書の置き場所を決める。"""
    value = (
        raw
        or os.environ.get('TROLLEY_DETECTOR_CERT_DIR')
        or DEFAULT_CERT_DIR
    )

    return Path(value).expanduser()


# ============================================================
# App
# ============================================================

def build_app(web_dir: Path) -> FastAPI:
    """静的ファイルだけを配る最小のアプリを作る。"""
    app = FastAPI(
        title='trolley detector',
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )

    # このポートは検出ページ専用なので、ルートに置いてURLを短くする。
    # スマートフォンで手入力することがあるため。
    app.mount(
        '/',
        StaticFiles(directory=web_dir, html=True),
        name='detector',
    )

    return app


# ============================================================
# Server
# ============================================================

def _make_server(config):
    """シグナルを横取りしないuvicornサーバを作る。

    このサーバはメインスレッド以外で動かす。uvicorn は既定で
    SIGINT/SIGTERM を握るが、2本目のサーバにまで握らせると
    Ctrl-C や launch からの終了要求がどちらに届くか分からなくなる。

    シグナル処理の API は uvicorn のバージョンで変わっているので、
    新旧どちらも潰しておく。
    """
    import uvicorn

    class _NoSignalServer(uvicorn.Server):

        def install_signal_handlers(self):
            """uvicorn < 0.22"""

        @contextlib.contextmanager
        def capture_signals(self):
            """uvicorn >= 0.22"""
            yield

    return _NoSignalServer(config)


def _prepare(host: str, port: int, cert_dir: str | None):
    """配信ディレクトリと証明書を用意して uvicorn の設定を組む。

    用意できなければ理由をログに出して None を返す。検出ページが無くても
    操作画面と走行は使えなければならないので、ここでの失敗を
    API サーバ側に伝播させない。
    """
    import uvicorn

    web_dir = resolve_detector_dir()

    if not (web_dir / 'index.html').is_file():
        logger.error(
            '検出ページが見つかりません (%s)。'
            'colcon build をやり直してください。',
            web_dir,
        )
        return None

    try:
        from trolley_api import tlscert
    except ImportError as exc:
        logger.error(
            '証明書の生成に必要な cryptography がありません (%s)。'
            'pip install cryptography を実行してください。',
            exc,
        )
        return None

    try:
        info = tlscert.ensure_cert(
            resolve_cert_dir(cert_dir),
            tlscert.local_ipv4s(),
        )
    except Exception as exc:
        logger.error('証明書を用意できませんでした: %s', exc)
        return None

    config = uvicorn.Config(
        build_app(web_dir),
        host=host,
        port=port,
        log_level='warning',
        ssl_certfile=str(info.cert_path),
        ssl_keyfile=str(info.key_path),
    )

    return config, info


def start_in_thread(
    host: str,
    port: int = DEFAULT_PORT,
    cert_dir: str | None = None,
) -> threading.Thread | None:
    """検出ページの HTTPS サーバをデーモンスレッドで起動する。

    起動できなかった場合は理由をログに出して None を返す。
    デーモンスレッドなので、メインプロセスが終われば一緒に落ちる。
    """
    prepared = _prepare(host, port, cert_dir)

    if prepared is None:
        return None

    config, info = prepared

    thread = threading.Thread(
        target=_make_server(config).run,
        name='detector-https',
        daemon=True,
    )
    thread.start()

    _log_startup(info, port)

    return thread


def _log_startup(info, port: int) -> None:
    """スマホから開くURLと、証明書の指紋を出す。"""
    if info.created:
        logger.info('自己署名証明書を発行しました: %s', info.cert_path)

    for ip in info.ips:
        if ip.startswith('127.'):
            continue
        logger.info('床タグ検出ページ: https://%s:%d/', ip, port)

    # スマホの警告画面に出る指紋と突き合わせると、
    # 別の機体につないでいないかを確認できる。
    logger.info('証明書 SHA-256: %s', info.fingerprint)
    logger.info(
        'ブラウザの「安全ではない」警告は自己署名のためです。'
        '上の指紋と一致していれば承認して進んでください。'
    )


# ============================================================
# Standalone entry point
# ============================================================

def main() -> None:
    """検出ページだけを単体で起動する。

    タグの貼り付け位置を決める、カメラの画角を合わせる、音量を確認する、
    といった設置作業では走行スタックを立ち上げたくない。
    そのためのエントリポイント。

        ros2 run trolley_api detector_server
    """
    import argparse
    import uvicorn

    parser = argparse.ArgumentParser(
        description='床タグ検出ページの配信サーバ (HTTPS)',
    )
    parser.add_argument(
        '--host',
        default=os.environ.get('TROLLEY_DETECTOR_HOST', '0.0.0.0'),
        help='待ち受けアドレス',
    )
    parser.add_argument(
        '--port',
        type=int,
        default=int(
            os.environ.get('TROLLEY_DETECTOR_PORT', DEFAULT_PORT)
        ),
        help='待ち受けポート',
    )
    parser.add_argument(
        '--cert-dir',
        default=None,
        help='自己署名証明書の置き場所',
    )

    # ros2 run から渡る --ros-args は使わないので捨てる
    args, _ = parser.parse_known_args()

    logging.basicConfig(
        level=logging.INFO,
        format='[%(levelname)s] [%(name)s]: %(message)s',
    )

    prepared = _prepare(args.host, args.port, args.cert_dir)

    if prepared is None:
        raise SystemExit(1)

    config, info = prepared

    _log_startup(info, args.port)

    # 単体起動ではメインスレッドなので、Ctrl-C はuvicornに任せてよい。
    uvicorn.Server(config).run()


if __name__ == '__main__':
    main()
