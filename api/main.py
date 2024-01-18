from fastapi import FastAPI
from pathlib import Path
from from_root import from_root, from_here
from common.motors import Motors
import asyncio
import os
import socket
import uvicorn

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
app = FastAPI()
amiga_motors = Motors()
UDP_IP = "10.95.76.21"
UDP_PORT = 8888
clear_core = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
clear_core.connect((UDP_IP, UDP_PORT))




@app.get("/")
async def root():
    return "Welcome!"


@app.get("/move_yaxis/{dist}")
async def move_yaxis():
    await amiga_motors.move_y(dist)


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

  # print(message)

  clear_core.send(msgbyte)
  take_image()
  return(clear_core.recv(1024))


# @app.get("/image")
def take_image():
    res = requests.get("http://10.95.76.50:5000/image")
    print(res.status_code, res.text)
    if res.status_code != 200:
        resr = requests.get("http://10.95.76.50:5000/image")
    return


if __name__ == "__main__":
    # run the server
    uvicorn.run(app, host="0.0.0.0", port=8042)