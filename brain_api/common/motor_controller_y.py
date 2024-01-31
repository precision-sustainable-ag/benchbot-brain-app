from __future__ import annotations

import asyncio
from pathlib import Path
import time
from from_root import from_root, from_here

from farm_ng.canbus.canbus_pb2 import Twist2d
from farm_ng.core.event_client import EventClient
from farm_ng.core.event_service_pb2 import EventServiceConfig
from farm_ng.core.events_file_reader import proto_from_json_file

# linear velocity in m/s and angular velocity is in rad/s
LINEAR_VELOCITY = 0.1
VELOCITY_INCREMENT = 0.05
ANGULAR_VELOCITY = 0.05

class MotorControllerY():
    def __init__(self, file_path=from_root("brain_api/common/service_config.json")):
        service_config_path = Path(file_path)
        self.twist = Twist2d()
        config: EventServiceConfig = proto_from_json_file(service_config_path, EventServiceConfig())
        self.client: EventClient = EventClient(config)

    async def move_motors(self, speeds, time_required) -> None:
        for speed in speeds:
            self.twist.linear_velocity_x = speed
            if abs(speed) == LINEAR_VELOCITY: treq = time_required
            else: treq = 0.05
            st = time.time()
            while time.time()-st < treq:
                await self.client.request_reply("/twist", self.twist)
                await asyncio.sleep(0.05)

    async def move_y(self, distance) -> None:
      distance_in_m = abs (distance / 100)
      time_required = (distance_in_m/LINEAR_VELOCITY) - 0.1
      if distance < 0:
        speeds = [-VELOCITY_INCREMENT, -LINEAR_VELOCITY, -VELOCITY_INCREMENT, 0]
      else:
        speeds = [VELOCITY_INCREMENT, LINEAR_VELOCITY, VELOCITY_INCREMENT, 0]

      await self.move_motors(speeds, abs(time_required))

