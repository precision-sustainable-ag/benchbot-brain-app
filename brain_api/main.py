from fastapi import FastAPI
from pathlib import Path
from from_root import from_root, from_here
from common.motors import Motors
import asyncio
import os
import socket
import uvicorn
import requests
from fastapi.staticfiles import StaticFiles
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
app = FastAPI()
amiga_motors = Motors()
UDP_IP = "10.95.76.21"
UDP_PORT = 8888
clear_core = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
clear_core.connect((UDP_IP, UDP_PORT))


@app.get("/move_yaxis/{dist}")
async def move_yaxis(dist):
    print('Y: ' + dist)
    await amiga_motors.move_y(float(dist))


# x, and z distance in cm
# +x is left, -x is right
# +z is down, -z is up
@app.get("/clearcore")
def move_xz_axis(x, z):
  # x axis -> 0.003175 cm per enocoder count
  # z axis -> 0.00529167 cm per encoder count
  x_steps_to_cm = 0.003175
  z_steps_to_cm = 0.000529167

  x_counts = int(x) // x_steps_to_cm
  z_counts = int(z) // z_steps_to_cm

  message = f"X:{x_counts} Z:{z_counts}"
  msgbyte = bytes(message, 'ascii')
  print(message)
  clear_core.send(msgbyte)
  return(clear_core.recv(1024))


@app.get("/home_x")
def home_x():
  message = f"X:999 Z:0"
  msgbyte = bytes(message, 'ascii')
  clear_core.send(msgbyte)
  return(clear_core.recv(1024))


@app.get("/home_z")
def home_z():
  message = f"X:0 Z:999"
  msgbyte = bytes(message, 'ascii')
  clear_core.send(msgbyte)
  return(clear_core.recv(1024))


if __name__ == "__main__":
    # run the server
    # parser = argparse.ArgumentParser()
    # parser.add_argument("--config", type=Path, required=True, help="config file")
    # parser.add_argument("--port", type=int, default=8042, help="port to run the server")
    # parser.add_argument("--debug", action="store_true", help="debug mode")
    # args = parser.parse_args()

    # # NOTE: we only serve the react app in debug mode
    # if not args.debug:
        # print("entered if block")
    react_build_directory = from_root("front_end/dist")

    print(react_build_directory)

    app.mount(
        "/",
        StaticFiles(directory=str(react_build_directory.resolve()), html=True),
    )

    uvicorn.run(app, host="0.0.0.0", port=8042)