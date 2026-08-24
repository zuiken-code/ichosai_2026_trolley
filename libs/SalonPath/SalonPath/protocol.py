import struct

from .enums import ControlType


HEADER_1 = 0xAA
HEADER_2 = 0x55


def crc16(data: bytes) -> int:
    crc = 0xFFFF

    for byte in data:
        crc ^= byte

        for _ in range(8):
            if crc & 1:
                crc = (crc >> 1) ^ 0xA001
            else:
                crc >>= 1

    return crc & 0xFFFF


def build_motor_packet(
    motor_id: int,
    control_type: ControlType,
    reference: float,
    sequence: int,
) -> bytes:

    payload = struct.pack(
        "<BBfB",
        motor_id,
        int(control_type),
        reference,
        sequence,
    )

    crc = crc16(payload)

    return (
        bytes([HEADER_1, HEADER_2])
        + payload
        + struct.pack("<H", crc)
    )