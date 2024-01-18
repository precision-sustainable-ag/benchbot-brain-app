from fastapi import FastAPI
from pathlib import Path
from from_root import from_root, from_here
from api.wheels import Motors
import asyncio
import os
import socket


app = FastAPI()
amiga_motors = Motors()
UDP_IP = "192.168.0.121"
UDP_PORT = 8888
clear_core = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
clear_core.connect((UDP_IP, UDP_PORT))


@app.get("/")
async def root():
    sup.create_new_dir()
    return "Welcome!"


@app.get("/yforward/{dist}")
async def move_forward():
    await amiga_motors.forward(dist)


@app.get("/yreverse/{dist}")
async def move_reverse():
    await amiga_motors.reverse(dist)


@app.get("/clearcore/{x}_{z}")
def move_xz_axis():
    msg = f"X:{x} Z:{z}"
    msgbyte = bytes(msg, 'ascii')
    # MESSAGE = b"X:1000 Z:0"
    # print("message: %s" % MESSAGE)
    clear_core.send(msgbyte)


@app.get("/image")
def take_image():
    res = requests.get("http://10.95.76.50:5000/image")
    print(res.status_code, res.text)
    if res.status_code != 200:
        resr = requests.get("http://10.95.76.50:5000/image")
    return


if __name__ == "__main__":
    # run the server
    uvicorn.run(app, host="0.0.0.0", port=8042)