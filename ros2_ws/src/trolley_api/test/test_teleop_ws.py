"""スマートフォンコントローラ用WebSocketブリッジの単体テスト。"""

import os

from trolley_api import teleop_ws


# ============================================================
# Fakes
# ============================================================

class FakeNode:
    """PhoneTeleopNode の代わり。"""

    def __init__(self, status=None):
        """状態を固定したノードを作る。"""
        self._status = status
        self.max_linear = 1.0
        self.max_angular = 1.0

    def get_status(self):
        """cmd_vel_mux の状態を返す。"""
        return self._status


class FakeBridge:
    """TeleopBridge の代わり。"""

    def __init__(self, status=None):
        """状態を固定したブリッジを作る。"""
        self.node = FakeNode(status)


# ============================================================
# 入力の正規化
# ============================================================

def test_clamp_input_keeps_value_in_range():
    """スティック入力は [-1.0, 1.0] に収める。"""
    assert teleop_ws._clamp_input(0.5) == 0.5
    assert teleop_ws._clamp_input(3.0) == 1.0
    assert teleop_ws._clamp_input(-3.0) == -1.0


def test_clamp_input_rejects_invalid_value():
    """数値でない値やNaNは0にする。"""
    assert teleop_ws._clamp_input(None) == 0.0
    assert teleop_ws._clamp_input('abc') == 0.0
    assert teleop_ws._clamp_input(float('nan')) == 0.0
    assert teleop_ws._clamp_input(float('inf')) == 0.0


# ============================================================
# 環境変数
# ============================================================

def test_env_float_falls_back_on_invalid_value():
    """異常値の環境変数は既定値にする。"""
    name = 'TROLLEY_TEST_MAX_LINEAR'

    os.environ[name] = 'not-a-number'

    try:
        assert teleop_ws._env_float(name, 1.0) == 1.0

        os.environ[name] = '-1.0'
        assert teleop_ws._env_float(name, 1.0) == 1.0

        os.environ[name] = '0.6'
        assert teleop_ws._env_float(name, 1.0) == 0.6

    finally:
        del os.environ[name]


def test_env_bool_reads_truthy_values():
    """真偽値の環境変数を読む。"""
    name = 'TROLLEY_TEST_INVERT'

    try:
        os.environ[name] = 'true'
        assert teleop_ws._env_bool(name, False) is True

        os.environ[name] = '0'
        assert teleop_ws._env_bool(name, True) is False

    finally:
        del os.environ[name]

    assert teleop_ws._env_bool(name, True) is True


# ============================================================
# セッション管理
# ============================================================

def test_first_session_becomes_driver():
    """最初に接続した端末が操作端末になる。"""
    registry = teleop_ws.SessionRegistry()

    first = registry.add(None)

    assert first.is_driver
    assert registry.driver is first
    assert len(registry) == 1


def test_second_session_is_observer():
    """2台目は操作端末にならない。"""
    registry = teleop_ws.SessionRegistry()

    first = registry.add(None)
    second = registry.add(None)

    assert first.is_driver
    assert not second.is_driver


def test_oldest_session_is_promoted_on_disconnect():
    """操作端末が抜けたら、残りのうち最も古い接続を昇格させる。"""
    registry = teleop_ws.SessionRegistry()

    first = registry.add(None)
    second = registry.add(None)
    third = registry.add(None)

    registry.remove(first)

    assert not first.is_driver
    assert registry.driver is second
    assert not third.is_driver


def test_no_driver_when_all_sessions_are_gone():
    """全て切断されたら操作端末は無くなる。"""
    registry = teleop_ws.SessionRegistry()

    session = registry.add(None)
    registry.remove(session)

    assert registry.driver is None
    assert len(registry) == 0


def test_set_driver_moves_control():
    """手動奪取で操作端末が入れ替わる。"""
    registry = teleop_ws.SessionRegistry()

    first = registry.add(None)
    second = registry.add(None)

    registry.set_driver(second)

    assert not first.is_driver
    assert second.is_driver


# ============================================================
# ブラウザへ送る状態
# ============================================================

def test_build_state_without_mux():
    """cmd_vel_mux の状態が未受信なら mux_available を落とす。"""
    original = teleop_ws._bridge
    teleop_ws._bridge = FakeBridge(None)

    try:
        session = teleop_ws.Session(1, None)
        session.is_driver = True

        state = teleop_ws.build_state(session)

        assert state['t'] == 'state'
        assert state['mux_available'] is False
        assert state['source'] is None
        assert state['joy_alive'] is False
        assert state['driver'] is True

    finally:
        teleop_ws._bridge = original


def test_build_state_with_mux():
    """cmd_vel_mux の状態をそのままブラウザ向けに詰め替える。"""
    original = teleop_ws._bridge

    teleop_ws._bridge = FakeBridge({
        'source': 'phone',
        'joy_alive': True,
        'phone_alive': True,
        'return_pending': True,
        'reason': 'manual_claim',
    })

    try:
        session = teleop_ws.Session(1, None)

        state = teleop_ws.build_state(session)

        assert state['mux_available'] is True
        assert state['source'] == 'phone'
        assert state['joy_alive'] is True
        assert state['return_pending'] is True
        assert state['driver'] is False

    finally:
        teleop_ws._bridge = original
