
import asyncio
import time
from pathlib import Path
# from motor_controller_y2 import MotorController_Y
from path_builder import PathBuilder
from track_follower import MotorController_Y


# y_motor_control = MotorController_Y(1, 0.1)

# async def move_y_axis():
#     await y_motor_control.run()

# def move_y_axis():
#     y_motor_control.run()
    
if __name__ == "__main__":
    # move_y_axis()

    # path_constructor = PathBuilder()
    # asyncio.run(path_constructor.build_path(4, 0.1))

    # path_follower = MotorController_Y(total_path_length=2, waypoint_gap=0.05, build_new_path=True)
    path_follower = MotorController_Y()
    path_follower.run()

