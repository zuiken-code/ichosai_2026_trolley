from enum import IntEnum


class ControlType(IntEnum):
    DUTY_CYCLE = 0
    VELOCITY = 1
    POSITION = 2
    DISABLE = 3