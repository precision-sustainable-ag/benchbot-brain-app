from __future__ import annotations

import asyncio
from pathlib import Path
from math import copysign
import time
from from_root import from_root, from_here
from path_builder import add_from_json_file, PathBuilder

from farm_ng.core.event_service_pb2 import SubscribeRequest
from farm_ng.core.events_file_reader import proto_from_json_file
from farm_ng.core.uri_pb2 import Uri
from farm_ng.track.track_pb2 import Track
from farm_ng.track.track_pb2 import TrackFollowerState
from farm_ng.track.track_pb2 import TrackFollowRequest
from google.protobuf.empty_pb2 import Empty



class MotorController_Y():
    def __init__(self, total_path_length=0, waypoint_gap=0, config_path=from_root("brain_api/common/service_config.json")):
        config_path=from_here("track_config.json")
        self.total_path_length = total_path_length
        self.waypoint_gap = waypoint_gap
        # Setup EventClients defined by the service file
        expected_configs = ["track_follower", "filter"]
        self.clients = add_from_json_file(expected_configs, config_path)
        # self.path_builder = PathBuilder(config_path)

    ''' Functions related to following the path'''
    # Set the track of the track_follower
    async def set_track(self, track: Track) -> None:
        await self.clients["track_follower"].request_reply("/set_track", TrackFollowRequest(track=track))

    # Request to start following the track
    async def start(self) -> None:
        await self.clients["track_follower"].request_reply("/start", Empty())

    # stream the track_follower state
    async def stream_status(self) -> None:
        await asyncio.sleep(1.0)
        message: TrackFollowerState
        async for _, message in self.clients["track_follower"].subscribe(SubscribeRequest(uri=Uri(path="/state"))):
            print("###################\n", message)

    # Start the trackfollower service to have the robot following the path
    async def start_track(self) -> None:
        # Build the track and package in a Track proto message
        # track: Track = await self.path_builder.build_path(self.total_path_length, self.waypoint_gap)
        # load track from json file
        track: Track = proto_from_json_file(from_here("robot_track.json"), Track())

        # Send the track to the track_follower
        await self.set_track(track)
        # Start following the track
        await self.start(self.clients)

    async def run_track_service(self) -> None:
        # Start the asyncio tasks
        tasks: list[asyncio.Task] = [
            asyncio.create_task(self.start_track()),
            asyncio.create_task(self.stream_status()),
        ]
        await asyncio.gather(*tasks)

    def run(self) -> None:
        # Create the asyncio event loop and run the track function
        loop = asyncio.get_event_loop()
        loop.run_until_complete(self.run_track_service())
