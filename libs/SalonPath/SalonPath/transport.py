import socket
import threading

from .protocol import build_motor_packet
from .enums import ControlType


class UDPTransport:

    def __init__(
        self,
        host: str,
        port: int,
        timeout: float = 1.0,
        debug: bool = True,
    ):
        self.host = host
        self.port = port
        self.timeout = timeout
        self.debug = debug

        self._socket = socket.socket(
            socket.AF_INET,
            socket.SOCK_DGRAM,
        )

        self._socket.settimeout(timeout)

        self._sequence = 0
        self._lock = threading.Lock()

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
            self._socket.sendto(
                packet,
                (self.host, self.port),
            )

            print(
                f"SEND motor={motor_id} "
                f"seq={sequence} "
                f"size={len(packet)}",
                flush=True,
            )

            return True

        except socket.timeout:
            print(
                f"[UDP TIMEOUT] "
                f"motor={motor_id} "
                f"seq={sequence} "
                f"target={self.host}:{self.port}",
                flush=True,
            )
            return False

        except OSError as e:
            print(
                f"[UDP ERROR] "
                f"motor={motor_id} "
                f"seq={sequence} "
                f"target={self.host}:{self.port} "
                f"error={e}",
                flush=True,
            )
            return False

    def close(self):
        try:
            self._socket.close()
        except OSError:
            pass