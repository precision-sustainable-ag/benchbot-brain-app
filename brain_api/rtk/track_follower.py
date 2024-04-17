from __future__ import annotations

import asyncio
from pathlib import Path
from datetime import datetime
import time
import signal
from from_root import from_root, from_here
from path_builder import add_from_json_file, PathBuilder

from farm_ng.core.event_service_pb2 import SubscribeRequest
from farm_ng.core.events_file_reader import proto_from_json_file
from farm_ng.core.events_file_writer import proto_to_json_file
from farm_ng.core.uri_pb2 import Uri
from farm_ng.track.track_pb2 import Track
from farm_ng.track.track_pb2 import TrackFollowerState
from farm_ng.track.track_pb2 import TrackFollowRequest
from google.protobuf.empty_pb2 import Empty

from farm_ng.filter.filter_pb2 import FilterState
from farm_ng_core_pybind import Pose3F64


log_dir = from_here("logs")
Path(log_dir).mkdir(parents=True, exist_ok=True)
curr_date = datetime.now().strftime('D%m%d_T%H%M')
logfile = f"logs/{curr_date}.log"
pose_file = f"logs/{curr_date}.json"


class MotorController_Y():
    def __init__(self, config_file="brain_api/rtk/track_config.json", build_new_path=False, total_path_length=0, waypoint_gap=0):
        config_file_path = from_root(config_file)
        # Setup EventClients defined by the service file
        expected_configs = ["track_follower", "filter"]
        self.clients = add_from_json_file(expected_configs, config_file_path)
        if build_new_path:
            self.path_builder = PathBuilder()
            self.total_path_length = total_path_length
            self.waypoint_gap = waypoint_gap

    async def get_pose(self) -> Pose3F64:
        state: FilterState = await self.clients["filter"].request_reply("/get_state", Empty(), decode=True)
        return Pose3F64.from_proto(state.pose)

    ''' Functions related to following the path'''
    # Set the track of the track_follower
    async def set_track(self, track: Track) -> None:
        await self.clients["track_follower"].request_reply("/set_track", TrackFollowRequest(track=track))

    # Request to start following the track
    async def start(self) -> None:
        await self.clients["track_follower"].request_reply("/start", Empty())
        print('Follower started')

    # Request to pause the track follower
    async def pause_track(self) -> None:
        await self.clients["track_follower"].request_reply("/pause", Empty())

    # Request to resume the track follower
    async def resume_track(self) -> None:
        await self.clients["track_follower"].request_reply("/resume", Empty())
    
    # Request to stop the track follower
    async def stop_track(self) -> None:
        print("sending cancel request")
        try:
            await self.clients["track_follower"].request_reply("/cancel", Empty())
            print("request sent")
        except:
            print("error in cancel request")

    # stream the track_follower state
    async def stream_status(self) -> None:
        await asyncio.sleep(1.0)
        message: TrackFollowerState
        start_time = time.time()
        distance_gap = 0.5
        last_distance_mark = None
        track_paused = False
        recorded_poses: list[Pose3F64] = []
        dist_list = []
        with open(logfile, "a") as l_file:
            async for _, message in self.clients["track_follower"].subscribe(SubscribeRequest(uri=Uri(path="/state"), every_n=1)):
                track_progress = message.progress
                if not last_distance_mark:
                    curr_pose = await self.get_pose()
                    recorded_poses.append(curr_pose)
                    # l_file.write(str(curr_pose.to_proto()))
                    last_distance_mark = track_progress.distance_total
                    print("Start:", last_distance_mark)
                    dist_list.append(last_distance_mark)
                if last_distance_mark-track_progress.distance_remaining >= distance_gap:
                    try:
                        await self.pause_track()
                    except:
                        pass
                    last_distance_mark = track_progress.distance_remaining
                    print("Pause:", last_distance_mark)
                    dist_list.append(last_distance_mark)
                    start_time = time.time()
                    track_paused = True
                    curr_pose = await self.get_pose()
                    # l_file.write(str(curr_pose.to_proto()))
                    recorded_poses.append(curr_pose)

                if track_paused:
                    if time.time()-start_time > 8:
                        await self.resume_track()
                        print("Resume:", time.time())
                        track_paused = False

                # if the track is completed
                if message.status.track_status == 5:
                    last_distance_mark = track_progress.distance_remaining
                    print("Finish:", last_distance_mark)
                    dist_list.append(last_distance_mark)
                    curr_pose = await self.get_pose()
                    # l_file.write(str(curr_pose.to_proto()))
                    recorded_poses.append(curr_pose)
                    print("COMPLETED!")
                    break
                # if there is issue with following the track
                if message.status.track_status == 7:
                    print("ABORTED!")
                    break
                # l_file.write(str(message))
                # print("###################\n", message.progress)
            l_file.write(str(dist_list))
        save_poses(recorded_poses)

    # Start the trackfollower service to have the robot following the path
    async def start_track(self, track_file: str) -> None:
        if hasattr(self, "path_builder"):
            # Build the track and package in a Track proto message
            track: Track = await self.path_builder.build_path(track_file, self.total_path_length, self.waypoint_gap)
        else:
            # load track from json file
            track: Track = proto_from_json_file(track_file, Track())
        # Send the track to the track_follower
        await self.set_track(track)
        # Start following the track
        await self.start()

    async def run_track_service(self, track_file: str) -> None:
        try:
            # Start the asyncio tasks
            tasks: list[asyncio.Task] = [
                asyncio.create_task(self.start_track(track_file)),
                asyncio.create_task(self.stream_status()),
            ]
            await asyncio.gather(*tasks)
        finally:
            print("from run_track_service")
            await self.stop_track()

    def run(self, track_file: str) -> None:
        # Create the asyncio event loop and run the track function
        loop = asyncio.get_event_loop()
        # handle KeyboardInterrupt
        loop.add_signal_handler(signal.SIGINT, self.signal_handler, loop)
        try:
            loop.run_until_complete(self.run_track_service(track_file))
        finally:
            loop.close()
    
    def signal_handler(self, loop):
        asyncio.ensure_future(self.stop_track(), loop=loop)


# Save poses list
def save_poses(r_poses) -> None:
    poses_list = [pose.to_proto() for pose in r_poses]
    pose_dict: Track = Track(waypoints=poses_list)
    if not proto_to_json_file(pose_file, pose_dict):
        raise RuntimeError(f"Failed to log poses")
    print(f"Saved {len(poses_list)} poses to {pose_file}")