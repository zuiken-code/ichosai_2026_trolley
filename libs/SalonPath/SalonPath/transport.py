import socket
import sys
import threading
import time

from .protocol import build_motor_packet
from .enums import ControlType


# 送信失敗を報告する最小間隔 [s]
#
# ESP32が落ちている間は毎周期まったく同じエラーになる。
# 50Hz x 2モーターで送っていると1秒あたり100行になってしまうため、
# 同じ状態が続く間は間引いて報告する。
ERROR_REPORT_INTERVAL = 1.0

# ロガーのメソッド名の候補。先に見つかったものを使う。
_LEVEL_METHODS = {
    'warning': ('warning', 'warn', 'error'),
    'info': ('info',),
}


class UDPTransport:
    """
    モーター指令をUDPで送るトランスポート。

    制御ループから毎周期呼ばれるため、以下を満たす必要がある。

    - 送信でブロックしない
      ソケットをノンブロッキングにしている。ブロッキングのままだと
      送信バッファが埋まったときに制御ループが止まり、
      ROSノード全体（購読コールバックを含む）が停止してしまう。

    - 正常系では一切ログを出さない
      1パケットごとに print(flush=True) すると、launch の
      output='screen' 経由ではパイプが詰まって write() がブロックし、
      これも制御ループを止める原因になる。
    """

    def __init__(
        self,
        host: str,
        port: int,
        timeout: float = None,
        debug: bool = False,
        logger=None,
    ):
        """
        Args:
            host: 送信先IPアドレス
            port: 送信先UDPポート
            timeout: 後方互換のために受け取るだけで使用しない。
                ソケットをノンブロッキングにしたため意味を持たない。
            debug: Trueにするとパケット内容を表示し、実際には送信しない
                （ドライラン）。走行中に有効化してはいけない。
            logger: `warning` / `info` を持つロガー（rclpyのロガー等）。
                省略時はstderrへ出力する。
        """
        self.host = host
        self.port = port
        self.debug = debug

        self._address = (host, port)
        self._logger = logger

        self._socket = socket.socket(
            socket.AF_INET,
            socket.SOCK_DGRAM,
        )

        # 制御ループを絶対にブロックさせない
        self._socket.setblocking(False)

        self._sequence = 0
        self._lock = threading.Lock()

        # 送信失敗の報告を間引くための状態
        self._failing = False
        self._last_error_report = None
        self._suppressed_errors = 0

    def _next_sequence(self) -> int:
        with self._lock:
            sequence = self._sequence
            self._sequence = (self._sequence + 1) & 0xFF

        return sequence

    def send(
        self,
        motor_id: int,
        control_type: ControlType,
        reference: float,
    ) -> bool:
        sequence = self._next_sequence()

        packet = build_motor_packet(
            motor_id=motor_id,
            control_type=control_type,
            reference=reference,
            sequence=sequence,
        )

        if self.debug:
            # ドライラン。送信はしない。
            print(
                f"[UDP DEBUG] "
                f"motor_id={motor_id}, "
                f"control_type={control_type.name}, "
                f"reference={reference:.2f}, "
                f"sequence={sequence}, "
                f"packet={packet.hex(' ')}",
                flush=True,
            )
            return True

        try:
            self._socket.sendto(packet, self._address)

        except (BlockingIOError, socket.timeout):
            # 送信バッファが埋まっている。指令は毎周期送り直すので、
            # 待つのではなく落として次の周期に任せる。
            self._report_failure(
                f"UDP send buffer full, packet dropped "
                f"(motor={motor_id}, seq={sequence})"
            )
            return False

        except OSError as e:
            self._report_failure(
                f"UDP send failed: {e} "
                f"(motor={motor_id}, seq={sequence}, "
                f"target={self.host}:{self.port})"
            )
            return False

        self._report_recovery()

        return True

    # =========================
    # 失敗報告（間引き付き）
    # =========================

    def _report_failure(self, message: str):
        """送信失敗を報告する。同じ状態が続く間は間引く。"""
        now = time.monotonic()

        self._failing = True

        if (
            self._last_error_report is not None
            and (now - self._last_error_report) < ERROR_REPORT_INTERVAL
        ):
            self._suppressed_errors += 1
            return

        if self._suppressed_errors:
            message = (
                f"{message} "
                f"[+{self._suppressed_errors} suppressed]"
            )

        self._emit(message, level='warning')

        self._last_error_report = now
        self._suppressed_errors = 0

    def _report_recovery(self):
        """失敗が続いた後に送信できたら1度だけ報告する。"""
        if not self._failing:
            return

        suppressed = self._suppressed_errors

        self._failing = False
        self._last_error_report = None
        self._suppressed_errors = 0

        note = f" (+{suppressed} suppressed)" if suppressed else ""

        self._emit(
            f"UDP send recovered: {self.host}:{self.port}{note}",
            level='info',
        )

    def _emit(self, message: str, level: str):
        """ロガーがあればそちらへ、無ければstderrへ出す。"""
        if self._logger is None:
            print(message, file=sys.stderr, flush=True)
            return

        # rclpyのロガーは warn() を持ち、warning() は新しめの
        # バージョンでのみ用意されている。制御ループの中で
        # AttributeError を出さないよう順に探す。
        for name in _LEVEL_METHODS[level]:
            method = getattr(self._logger, name, None)

            if method is not None:
                method(message)
                return

        print(message, file=sys.stderr, flush=True)

    def close(self):
        try:
            self._socket.close()
        except OSError:
            pass
