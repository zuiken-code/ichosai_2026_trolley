from .closed_loop import ClosedLoopController
from .enums import ControlType


class SalonPath:

    def __init__(self, bus, motor_id: int):
        self.bus = bus
        self.motor_id = motor_id

        self._reference = 0.0
        self._control_type = ControlType.DISABLE

        self._closed_loop_controller = ClosedLoopController(self)

        # Busに自分を登録
        self.bus.register_motor(self)

    def setReference(self, reference, control_type):

        self._reference = reference
        self._control_type = control_type

        # Busへ送信
        self.bus.send_motor_command(self)

    def getReference(self):
        return self._reference

    def getControlType(self):
        return self._control_type

    def getClosedLoopController(self):
        return self._closed_loop_controller
