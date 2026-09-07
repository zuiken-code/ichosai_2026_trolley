"""
操作権（Joy / スマートフォン）の調停ロジック。

ROSに依存しない純粋な状態機械として実装しているため、
単体テストだけで挙動を検証できる。

時刻は呼び出し側から単調増加の秒数（time.monotonic()など）を渡す。
"""

from enum import Enum


# ============================================================
# Source
# ============================================================

class TeleopSource(Enum):
    """操作権を持つ入力源。"""

    JOY = 'joy'
    PHONE = 'phone'


# ============================================================
# Arbiter
# ============================================================

class SourceArbiter:
    """
    Joyとスマートフォンのどちらに操作権を与えるかを決める。

    方針:
        - 通常はJoy（Switchコントローラ）が操作権を持つ。
        - Joyが joy_timeout 秒途絶したら、自動でスマートフォンへ移す。
        - Joyが生きている間の奪取は、スマートフォンからの明示的な要求のみ。
        - Joyが復帰しても自動では戻さず、返却は明示的な要求で行う。
          （UIには return_pending として通知し、ボタンを出す）
        - 例外として、スマートフォンが phone_lost_timeout 秒以上
          途絶し、かつJoyが生きている場合のみ自動でJoyへ戻す。
          バックアップ端末を紛失・電池切れした際に
          操縦不能になるのを防ぐための安全側の挙動。
    """

    def __init__(
        self,
        joy_timeout: float = 1.0,
        phone_timeout: float = 0.5,
        phone_lost_timeout: float = 2.0,
        auto_return_on_phone_loss: bool = True,
    ):
        """
        調停器を初期化する。

        Args:
            joy_timeout: Joyを途絶と見なすまでの時間 [s]
            phone_timeout: スマホを途絶と見なすまでの時間 [s]
            phone_lost_timeout: スマホを喪失と見なすまでの時間 [s]
            auto_return_on_phone_loss: スマホ喪失時に自動でJoyへ戻すか
        """
        self.joy_timeout = joy_timeout
        self.phone_timeout = phone_timeout
        self.phone_lost_timeout = phone_lost_timeout
        self.auto_return_on_phone_loss = auto_return_on_phone_loss

        self._source = TeleopSource.JOY

        self._joy_stamp = None
        self._phone_stamp = None

        self._reason = 'init'

    # =========================
    # 受信通知
    # =========================

    def notify_joy(self, now: float) -> None:
        """Joy由来のコマンドを受信したことを通知する。"""
        self._joy_stamp = now

    def notify_phone(self, now: float) -> None:
        """スマートフォン由来のコマンドを受信したことを通知する。"""
        self._phone_stamp = now

    # =========================
    # 生存判定
    # =========================

    @staticmethod
    def _elapsed(stamp, now: float):
        """最終受信からの経過時間を返す。未受信ならNone。"""
        if stamp is None:
            return None

        return now - stamp

    def is_joy_alive(self, now: float) -> bool:
        """Joyが生きているか。"""
        elapsed = self._elapsed(self._joy_stamp, now)

        return elapsed is not None and elapsed <= self.joy_timeout

    def is_phone_alive(self, now: float) -> bool:
        """スマートフォンが生きているか。"""
        elapsed = self._elapsed(self._phone_stamp, now)

        return elapsed is not None and elapsed <= self.phone_timeout

    def is_phone_lost(self, now: float) -> bool:
        """スマートフォンを喪失と見なすか。"""
        elapsed = self._elapsed(self._phone_stamp, now)

        return elapsed is None or elapsed > self.phone_lost_timeout

    # =========================
    # 明示的な操作権の要求
    # =========================

    def request_phone(self, now: float):
        """
        スマートフォンへ操作権を移す（手動奪取）。

        Returns:
            (成否, メッセージ)
        """
        if not self.is_phone_alive(now):
            return False, 'スマートフォンから操作入力が届いていません'

        if self._source == TeleopSource.PHONE:
            return True, 'すでにスマートフォンが操作権を持っています'

        self._source = TeleopSource.PHONE
        self._reason = 'manual_claim'

        return True, 'スマートフォンへ操作権を移しました'

    def release_to_joy(self, now: float):
        """
        Joyへ操作権を返す（明示的な返却）。

        Returns:
            (成否, メッセージ)
        """
        if not self.is_joy_alive(now):
            return False, 'Switchコントローラから入力が届いていません'

        if self._source == TeleopSource.JOY:
            return True, 'すでにSwitchコントローラが操作権を持っています'

        self._source = TeleopSource.JOY
        self._reason = 'manual_release'

        return True, 'Switchコントローラへ操作権を戻しました'

    # =========================
    # 定期更新
    # =========================

    def update(self, now: float) -> TeleopSource:
        """
        自動フェイルオーバ／喪失時復帰を反映し、現在の操作権を返す。

        制御周期ごとに呼び出す。
        """
        joy_alive = self.is_joy_alive(now)

        if self._source == TeleopSource.JOY:

            # Joyが途絶し、スマホが生きているなら自動で移す
            if not joy_alive and self.is_phone_alive(now):
                self._source = TeleopSource.PHONE
                self._reason = 'joy_lost'

        elif self._source == TeleopSource.PHONE:

            # スマホを喪失し、Joyが生きているなら安全側でJoyへ戻す
            if (
                self.auto_return_on_phone_loss
                and joy_alive
                and self.is_phone_lost(now)
            ):
                self._source = TeleopSource.JOY
                self._reason = 'phone_lost'

        return self._source

    # =========================
    # 状態の参照
    # =========================

    @property
    def source(self) -> TeleopSource:
        """現在操作権を持つ入力源。"""
        return self._source

    @property
    def reason(self) -> str:
        """最後に操作権が決まった理由。"""
        return self._reason

    def is_active_source_alive(self, now: float) -> bool:
        """操作権を持つ入力源が生きているか。"""
        if self._source == TeleopSource.JOY:
            return self.is_joy_alive(now)

        return self.is_phone_alive(now)

    def is_return_pending(self, now: float) -> bool:
        """
        Joyへの返却をUIに促すべきか。

        スマホが操作権を持ち、かつJoyが復帰している状態を指す。
        """
        return (
            self._source == TeleopSource.PHONE
            and self.is_joy_alive(now)
        )

    def state(self, now: float) -> dict:
        """UIやトピックへ流す状態を辞書で返す。"""
        return {
            'source': self._source.value,
            'joy_alive': self.is_joy_alive(now),
            'phone_alive': self.is_phone_alive(now),
            'return_pending': self.is_return_pending(now),
            'reason': self._reason,
        }
