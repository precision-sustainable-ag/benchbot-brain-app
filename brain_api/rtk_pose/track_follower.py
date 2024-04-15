from __future__ import annotations

import asyncio
from pathlib import Path
from datetime import datetime
import time
import signal
from from_root import from_root, from_here
from path_builder import add_from_json_file, PathBuilder

import json
import numpy as np
from scipy.spatial.distance import cdist
from farm_ng_core_pybind import Pose3F64

from farm_ng.core.event_service_pb2 import SubscribeRequest
from farm_ng.core.events_file_reader import proto_from_json_file
from farm_ng.core.uri_pb2 import Uri
from farm_ng.track.track_pb2 import Track
from farm_ng.track.track_pb2 import TrackFollowerState
from farm_ng.track.track_pb2 import TrackFollowRequest
from google.protobuf.empty_pb2 import Empty


log_dir = from_here("logs")
Path(log_dir).mkdir(parents=True, exist_ok=True)
curr_date = datetime.now().strftime('%m-%d_%H:%M')
logfile = f"logs/{curr_date}_track.log"          


class MotorController_Y():
    def __init__(self, config_file="brain_api/rtk_pose/track_config.json", build_new_path=False, total_path_length=0, waypoint_gap=0):
        config_file_path = from_root(config_file)
        # Setup EventClients defined by the service file
        expected_configs = ["track_follower"]
        self.clients = add_from_json_file(expected_configs, config_file_path)
        if build_new_path:
            self.path_builder = PathBuilder()
            self.total_path_length = total_path_length
            self.waypoint_gap = waypoint_gap
        self.track_flag = True

    ''' Functions related to following the path'''
    # Request to stop the track follower
    async def stop_track(self) -> None:
        try:
            print("sending cancel request")
            await self.clients["track_follower"].request_reply("/cancel", Empty())
            print("request sent")
        except:
            pass

    # stream the track_follower state
    async def stream_status(self) -> None:
        await asyncio.sleep(1.0)
        message: TrackFollowerState
        with open(logfile, "a") as l_file:
            async for _, message in self.clients["track_follower"].subscribe(SubscribeRequest(uri=Uri(path="/state"), every_n=20)):
                l_file.write(str(message))
                status = message.status.track_status
                print(f"Status code: {status}\tDistance: {message.progress.distance_remaining}")
                # if there is issue with following the track
                if status in [0, 6, 7, 8]:
                    print("Stop message streaming")
                    break
                

    # Start the trackfollower service to have the robot following the path
    async def start_track(self, track_file: str) -> None:
        if hasattr(self, "path_builder"):
            # Build the track and package in a Track proto message
            track: Track = await self.path_builder.build_path(track_file, self.total_path_length, self.waypoint_gap)
        else:
            # load track from json file
            track: Track = proto_from_json_file(track_file, Track())
        self.poses = get_poses(track, 0.5)
        print('Retrieved Poses')
        # await self.start()
        for target_pose in self.poses:
            print(f"x: {target_pose.a_from_b.translation.x}, y: {target_pose.a_from_b.translation.y}")
            await self.clients["track_follower"].request_reply("/go_to_goal", target_pose)
            print('Pose request sent')
            
            # wait between poses
            await asyncio.sleep(10.0)
            # break
        print('Poses done')

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
            print("from run")
            loop.run_until_complete(self.stop_track())
            loop.close()
    
    def signal_handler(self, loop):
        asyncio.ensure_future(self.stop_track(), loop=loop)
        exit(1)


def get_poses(track: Track, track_gap) -> list[Pose3F64]:
    complete_track = track.waypoints
    sub_track: list[Pose3F64] = []
    previous_pose = None
    for waypoint in complete_track:
        if not previous_pose:
            sub_track.append(waypoint)
            previous_pose = waypoint
        else:
            p1 = [ [ previous_pose.a_from_b.translation.x, previous_pose.a_from_b.translation.y ] ]
            p2 = [ [ waypoint.a_from_b.translation.x,    waypoint.a_from_b.translation.y ] ]
            dist = round(cdist(p1, p2, 'euclidean')[0][0], 2)
            if dist >= track_gap:
                # print(f"Distance gap: {dist}")
                sub_track.append(waypoint)
                previous_pose = waypoint
    return sub_track

