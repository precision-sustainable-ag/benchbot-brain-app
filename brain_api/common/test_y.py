import asyncio
from motor_controller_y import MotorControllerY
import time

y_motor_control = MotorControllerY()

async def move_y_axis(dist):
    for i in range(3):
        print(f"\nIteration: {i+1}, Distance: {(i+1)*0.5} m")
        if i==0:
            print("add left turn")
            y_motor_control.set_turn('left')
        if i==2:
            print("add right turn")
            y_motor_control.set_turn('right')
        await y_motor_control.move_y(float(dist))
        # wait between movements
        time.sleep(5)
    
    # release motor control
    y_motor_control.end_motor_hold()
    print("\nFinished\n")


if __name__ == "__main__":
    asyncio.run(move_y_axis(50))
