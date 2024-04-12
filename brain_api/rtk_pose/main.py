from track_follower import MotorController_Y
import time

track_file_name = "bb_track.json"

if __name__ == "__main__":
    path_follower = MotorController_Y(build_new_path=False, total_path_length=2, waypoint_gap=0.1)
    path_follower.run(track_file_name)
