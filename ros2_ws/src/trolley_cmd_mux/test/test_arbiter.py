"""操作権調停ロジックの単体テスト。"""

from trolley_cmd_mux.arbiter import SourceArbiter, TeleopSource


def make_arbiter(**kwargs):
    """テスト用の調停器を作る。"""
    params = {
        'joy_timeout': 1.0,
        'phone_timeout': 0.5,
        'phone_lost_timeout': 2.0,
    }
    params.update(kwargs)

    return SourceArbiter(**params)


def test_initial_source_is_joy():
    """初期状態ではJoyが操作権を持つ。"""
    arbiter = make_arbiter()

    assert arbiter.source == TeleopSource.JOY
    assert arbiter.update(0.0) == TeleopSource.JOY


def test_no_input_means_active_source_is_not_alive():
    """入力が無い間は操作権を持つ入力源も生存扱いにしない。"""
    arbiter = make_arbiter()

    assert not arbiter.is_active_source_alive(0.0)


def test_joy_keeps_control_while_alive():
    """Joyが生きている間はスマホ入力があってもJoyが操作権を持つ。"""
    arbiter = make_arbiter()

    arbiter.notify_joy(10.0)
    arbiter.notify_phone(10.0)

    assert arbiter.update(10.1) == TeleopSource.JOY
    assert arbiter.is_active_source_alive(10.1)


def test_auto_failover_when_joy_is_lost():
    """Joyが途絶し、スマホが生きていれば自動でスマホへ移る。"""
    arbiter = make_arbiter()

    arbiter.notify_joy(10.0)
    arbiter.notify_phone(11.2)

    assert arbiter.update(11.3) == TeleopSource.PHONE
    assert arbiter.reason == 'joy_lost'


def test_no_failover_when_phone_is_also_dead():
    """スマホも途絶していればJoyのまま、停止指令を出させる。"""
    arbiter = make_arbiter()

    arbiter.notify_joy(10.0)

    assert arbiter.update(12.0) == TeleopSource.JOY
    assert not arbiter.is_active_source_alive(12.0)


def test_manual_claim_requires_live_phone():
    """スマホ入力が届いていなければ手動奪取は失敗する。"""
    arbiter = make_arbiter()

    success, _ = arbiter.request_phone(10.0)

    assert not success
    assert arbiter.source == TeleopSource.JOY


def test_manual_claim_while_joy_is_alive():
    """Joyが生きていても手動奪取ならスマホへ移る。"""
    arbiter = make_arbiter()

    arbiter.notify_joy(10.0)
    arbiter.notify_phone(10.0)

    success, _ = arbiter.request_phone(10.1)

    assert success
    assert arbiter.update(10.1) == TeleopSource.PHONE
    assert arbiter.reason == 'manual_claim'


def test_joy_recovery_does_not_take_control_back():
    """Joyが復帰しても自動では戻さず、返却待ちを通知する。"""
    arbiter = make_arbiter()

    arbiter.notify_phone(10.0)
    arbiter.request_phone(10.0)

    # Joyが復帰
    arbiter.notify_joy(10.4)
    arbiter.notify_phone(10.4)

    assert arbiter.update(10.5) == TeleopSource.PHONE
    assert arbiter.is_return_pending(10.5)


def test_release_to_joy_requires_live_joy():
    """Joyが生きていなければ返却は失敗する。"""
    arbiter = make_arbiter()

    arbiter.notify_phone(10.0)
    arbiter.request_phone(10.0)

    success, _ = arbiter.release_to_joy(10.1)

    assert not success
    assert arbiter.source == TeleopSource.PHONE


def test_release_to_joy_hands_control_back():
    """明示的な返却でJoyへ操作権が戻る。"""
    arbiter = make_arbiter()

    arbiter.notify_phone(10.0)
    arbiter.request_phone(10.0)

    arbiter.notify_joy(10.4)

    success, _ = arbiter.release_to_joy(10.5)

    assert success
    assert arbiter.update(10.5) == TeleopSource.JOY
    assert not arbiter.is_return_pending(10.5)


def test_auto_return_when_phone_is_lost():
    """スマホを喪失し、Joyが生きていれば安全側でJoyへ戻す。"""
    arbiter = make_arbiter()

    arbiter.notify_phone(10.0)
    arbiter.request_phone(10.0)

    # スマホは10.0で最後、Joyは生き続けている
    arbiter.notify_joy(12.5)

    assert arbiter.update(12.5) == TeleopSource.JOY
    assert arbiter.reason == 'phone_lost'


def test_auto_return_can_be_disabled():
    """auto_return_on_phone_loss を切ればスマホが操作権を保持する。"""
    arbiter = make_arbiter(auto_return_on_phone_loss=False)

    arbiter.notify_phone(10.0)
    arbiter.request_phone(10.0)

    arbiter.notify_joy(12.5)

    assert arbiter.update(12.5) == TeleopSource.PHONE


def test_phone_loss_without_joy_keeps_phone_and_stops():
    """Joyも死んでいれば操作権は移さず、停止指令を出させる。"""
    arbiter = make_arbiter()

    arbiter.notify_phone(10.0)
    arbiter.request_phone(10.0)

    assert arbiter.update(13.0) == TeleopSource.PHONE
    assert not arbiter.is_active_source_alive(13.0)


def test_failover_recovers_after_auto_return():
    """自動復帰後に再びJoyが途絶すれば、またスマホへ移る。"""
    arbiter = make_arbiter()

    arbiter.notify_phone(10.0)
    arbiter.request_phone(10.0)

    arbiter.notify_joy(12.5)
    assert arbiter.update(12.5) == TeleopSource.JOY

    arbiter.notify_phone(13.8)

    assert arbiter.update(13.9) == TeleopSource.PHONE
    assert arbiter.reason == 'joy_lost'


def test_state_contains_ui_fields():
    """UIへ渡す状態が必要なキーを持つ。"""
    arbiter = make_arbiter()

    arbiter.notify_joy(10.0)
    state = arbiter.state(10.1)

    assert state == {
        'source': 'joy',
        'joy_alive': True,
        'phone_alive': False,
        'return_pending': False,
        'reason': 'init',
    }
