from __future__ import annotations

import asyncio
from pathlib import Path
from math import copysign
import time
from from_root import from_root, from_here

from farm_ng.core.event_client import EventClient
from farm_ng.core.event_service_pb2 import EventServiceConfigList
from farm_ng.core.event_service_pb2 import SubscribeRequest
from farm_ng.core.events_file_reader import proto_from_json_file
from farm_ng.core.uri_pb2 import Uri
from farm_ng.filter.filter_pb2 import FilterState
from farm_ng.track.track_pb2 import Track
from farm_ng.track.track_pb2 import TrackFollowerState
from farm_ng.track.track_pb2 import TrackFollowRequest
from farm_ng_core_pybind import Isometry3F64
from farm_ng_core_pybind import Pose3F64
from farm_ng_core_pybind import Rotation3F64
from google.protobuf.empty_pb2 import Empty



class MotorController_Y():
    def __init__(self, total_path_length, waypoint_gap, config_path=from_root("brain_api/common/service_config.json")):
        config_path=from_here("track_config.json")
        self.total_path_length = total_path_length
        self.waypoint_gap = waypoint_gap
        # Setup EventClients defined by the service file
        self.clients: dict[str, EventClient] = {}
        expected_configs = ["track_follower", "filter"]
        config_list = proto_from_json_file(config_path, EventServiceConfigList())
        for config in config_list.configs:
            if config.name in expected_configs:
                self.clients[config.name] = EventClient(config)
        for config in expected_configs:
            if config not in self.clients:
                raise RuntimeError(f"No {config} service config in {config_path}")

    ''' Functions related to creating a straight path'''
    # Get the current pose of the robot in the world frame, from the filter service
    async def get_pose(self, clients: dict[str, EventClient]) -> Pose3F64:
        state: FilterState = await clients["filter"].request_reply("/get_state", Empty(), decode=True)
        return Pose3F64.from_proto(state.pose)

    # Build a straight path track, from the current pose of the robot
    async def build_path(self, clients: dict[str, EventClient], track_length: float, track_resolution: float) -> Track:
        # get current pose of the robot in the world frame from the state estimation filter
        world_pose_robot: Pose3F64 = await self.get_pose(clients)
        # list to store the track waypoints
        track_waypoints: list[Pose3F64] = []
        # Add current pose of the robot as the first goal
        world_pose_goal0: Pose3F64 = world_pose_robot * Pose3F64(a_from_b=Isometry3F64(), frame_a="robot", frame_b="goal0")
        track_waypoints.append(world_pose_goal0)
        # creat a straight path given the length and the space between waypoints
        track_waypoints.extend(self.create_straight_path(track_waypoints[-1], "goal", track_length, track_resolution))

        # Return the list of waypoints as a Track proto message
        return self.format_track(track_waypoints)

    # distance and spacing are in meters
    def create_straight_path(self, previous_pose: Pose3F64, next_frame_b: str, distance: float, spacing: float = 0.1) -> list[Pose3F64]:
        track_poses: list[Pose3F64] = [previous_pose]
        counter: int = 0
        remaining_distance: float = distance

        while abs(remaining_distance) > 0.01:
            # Compute the distance of the next segment
            segment_distance: float = copysign(min(abs(remaining_distance), spacing), distance)
            # Compute the next pose
            straight_segment: Pose3F64 = Pose3F64(
                a_from_b=Isometry3F64([segment_distance, 0, 0], Rotation3F64.Rz(0)),
                frame_a=track_poses[-1].frame_b,
                frame_b=f"{next_frame_b}_{counter}",
            )
            track_poses.append(track_poses[-1] * straight_segment)
            counter += 1
            remaining_distance -= segment_distance

        # Rename the last pose to the desired name
        track_poses[-1].frame_b = next_frame_b
        return track_poses
    
    # Pack the track waypoints into a Track proto message
    def format_track(self, track_waypoints: list[Pose3F64]) -> Track:
        return Track(waypoints=[pose.to_proto() for pose in track_waypoints])
    

    ''' Functions related to following the path'''
    # Set the track of the track_follower
    async def set_track(self, clients: dict[str, EventClient], track: Track) -> None:
        await clients["track_follower"].request_reply("/set_track", TrackFollowRequest(track=track))

    # Request to start following the track
    async def start(self, clients: dict[str, EventClient]) -> None:
        await clients["track_follower"].request_reply("/start", Empty())

    # stream the track_follower state
    async def stream_status(self, clients: dict[str, EventClient]) -> None:
        await asyncio.sleep(1.0)
        message: TrackFollowerState
        async for _, message in clients["track_follower"].subscribe(SubscribeRequest(uri=Uri(path="/state"))):
            print("###################\n", message)

    # Start the trackfollower service to have the robot following the path
    async def start_track(self, clients: dict[str, EventClient], path_length: float, path_resolution: float) -> None:
        # Build the track and package in a Track proto message
        track: Track = await self.build_path(clients, path_length, path_resolution)
        # Send the track to the track_follower
        await self.set_track(clients, track)
        # Start following the track
        await self.start(clients)

    async def run_track_service(self) -> None:
        # Start the asyncio tasks
        tasks: list[asyncio.Task] = [
            asyncio.create_task(self.start_track(self.clients, self.total_path_length, self.waypoint_gap)),
            asyncio.create_task(self.stream_status(self.clients)),
        ]
        await asyncio.gather(*tasks)

    def run(self) -> None:
        # Create the asyncio event loop and run the track function
        loop = asyncio.get_event_loop()
        loop.run_until_complete(self.run_track_service())
