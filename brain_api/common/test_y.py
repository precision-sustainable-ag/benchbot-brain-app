import asyncio
from motor_controller_y import MotorControllerY

y_motor_control = MotorControllerY()

async def move_y_axis(dist):
    for i in range(3):
        print(f"Iteration: {i+1}, Distance: {(i+1)*0.5} m")
        if i==0:
            y_motor_control.set_turn('left')
        if i==2:
            y_motor_control.set_turn('right')
        await y_motor_control.move_y(float(dist))
        await y_motor_control.hold_position(time_s=5)


if __name__ == "__main__":
    asyncio.run(move_y_axis(50))