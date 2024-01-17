from fastapi import FastAPI
from pathlib import Path
from from_root import from_root, from_here
from api.wheels import Motors
import asyncio
import os


app = FastAPI()
amiga_motors = Motors()

@app.get("/")
async def root():
    sup.create_new_dir()
    return "Welcome!"

@app.get("/forward")
async def move_forward():
    await amiga_motors.forward()

@app.get("/reverse")
async def move_reverse():
    await amiga_motors.reverse()