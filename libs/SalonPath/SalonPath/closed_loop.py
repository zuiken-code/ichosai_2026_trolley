class ClosedLoopController:
    def __init__(self, motor):
        self.motor = motor

    def setReference(self, reference, control_type):
        self.motor.setReference(
            reference,
            control_type
        )