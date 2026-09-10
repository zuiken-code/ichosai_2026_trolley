"""APIサーバ起動スクリプトの引数解釈のテスト。

launch から渡される `--host` / `--port` / `--detector` が
実際に効いているかを見る。console_scripts が引数を読まない
エントリポイントを指していて、launch の api_host / api_port が
黙って無視されていたことがあるため。
"""

import pytest

from trolley_api import run_server


# ============================================================
# Helpers
# ============================================================

def parse(monkeypatch, argv, env=None):
    """argv と環境変数を差し替えて parse_args() を呼ぶ。"""
    monkeypatch.setattr('sys.argv', ['api_server', *argv])

    for name in (
        'TROLLEY_API_HOST',
        'TROLLEY_API_PORT',
        'TROLLEY_DETECTOR_PORT',
        'TROLLEY_DETECTOR_ENABLED',
    ):
        monkeypatch.delenv(name, raising=False)

    for name, value in (env or {}).items():
        monkeypatch.setenv(name, value)

    return run_server.parse_args()


# ============================================================
# 既定値
# ============================================================

def test_defaults(monkeypatch):
    """引数も環境変数も無ければ既定値を使う。"""
    args = parse(monkeypatch, [])

    assert args.host == run_server.DEFAULT_HOST
    assert args.port == run_server.DEFAULT_PORT
    assert args.detector is True
    assert args.detector_port == 8443


# ============================================================
# launch から渡される形
# ============================================================

def test_host_and_port_are_honored(monkeypatch):
    """--host / --port が読まれる。"""
    args = parse(monkeypatch, ['--host', '127.0.0.1', '--port', '9000'])

    assert args.host == '127.0.0.1'
    assert args.port == 9000


def test_detector_accepts_launch_style_booleans(monkeypatch):
    """LaunchConfiguration は 'true' / 'false' という文字列で届く。"""
    assert parse(monkeypatch, ['--detector', 'false']).detector is False
    assert parse(monkeypatch, ['--detector', 'true']).detector is True


def test_detector_port_is_honored(monkeypatch):
    """--detector-port が読まれる。"""
    args = parse(monkeypatch, ['--detector-port', '9443'])

    assert args.detector_port == 9443


def test_ros_args_are_ignored(monkeypatch):
    """launch が付ける --ros-args で落ちない。"""
    args = parse(
        monkeypatch,
        [
            '--port', '9000',
            '--ros-args', '-p', 'max_linear:=0.6',
        ],
    )

    assert args.port == 9000


def test_bare_detector_flag_means_enabled(monkeypatch):
    """値なしの --detector は有効の意味にする。"""
    assert parse(monkeypatch, ['--detector']).detector is True


def test_invalid_detector_value_is_rejected(monkeypatch):
    """真偽値として読めない値は黙って無視せずエラーにする。"""
    with pytest.raises(SystemExit):
        parse(monkeypatch, ['--detector', 'maybe'])


# ============================================================
# 環境変数
# ============================================================

def test_env_provides_defaults(monkeypatch):
    """環境変数でも指定できる。"""
    args = parse(
        monkeypatch,
        [],
        env={
            'TROLLEY_API_PORT': '9100',
            'TROLLEY_DETECTOR_PORT': '9443',
            'TROLLEY_DETECTOR_ENABLED': 'false',
        },
    )

    assert args.port == 9100
    assert args.detector_port == 9443
    assert args.detector is False


def test_argv_beats_env(monkeypatch):
    """引数は環境変数より優先される。"""
    args = parse(
        monkeypatch,
        ['--port', '9200'],
        env={'TROLLEY_API_PORT': '9100'},
    )

    assert args.port == 9200


def test_broken_env_falls_back_to_default(monkeypatch):
    """環境変数が壊れていても既定値で起動できる。"""
    args = parse(
        monkeypatch,
        [],
        env={
            'TROLLEY_API_PORT': 'えいと',
            'TROLLEY_DETECTOR_ENABLED': 'たぶん',
        },
    )

    assert args.port == run_server.DEFAULT_PORT
    assert args.detector is True
