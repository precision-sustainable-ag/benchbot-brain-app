
import asyncio
import time
from pathlib import Path
from motor_controller_y2 import MotorController_Y


y_motor_control = MotorController_Y(1, 0.1)

# async def move_y_axis():
#     await y_motor_control.run()

def move_y_axis():
    y_motor_control.run()
    
if __name__ == "__main__":

    move_y_axis()
    

