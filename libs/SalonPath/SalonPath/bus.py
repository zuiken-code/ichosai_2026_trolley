from .enums import ControlType

class MotorBus:
    def __init__(self, transport):
        self.transport = transport
        self.motors = {}

    def register_motor(self, motor):
        if motor.motor_id in self.motors:
            raise ValueError(
                f"Motor ID {motor.motor_id} is already registered"
            )

        self.motors[motor.motor_id] = motor

    def get_motor(self, motor_id):
        return self.motors[motor_id]

    def send_motor_command(self, motor):
        self.transport.send(
            motor.motor_id,
            motor.getControlType(),
            motor.getReference()
        )
        # print(
        #     f"[MotorBus] sending motor_id={motor.motor_id}",
        #     flush=True,
        #     )

    def stop_all(self):
        for motor in self.motors.values():
            motor.setReference(
                0.0,
                motor.getControlType()
            )