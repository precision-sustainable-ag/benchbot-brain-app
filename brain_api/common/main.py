
import asyncio
import time
from pathlib import Path
from motor_controller_y2 import MotorController_Y
from path_builder import PathBuilder


y_motor_control = MotorController_Y(1, 0.1)

path_constructor = PathBuilder()

# async def move_y_axis():
#     await y_motor_control.run()

def move_y_axis():
    y_motor_control.run()
    
if __name__ == "__main__":

    # move_y_axis()
    path_constructor.build_path(1, 0.01)
    

