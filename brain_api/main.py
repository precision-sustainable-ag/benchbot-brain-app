from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from from_root import from_root, from_here
from common.motor_controller_y import MotorControllerY
from common.motor_controller_xz import MotorControllerXZ
import uvicorn
import logging
import json
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

y_motor_control = MotorControllerY()
xz_motor_control = MotorControllerXZ()
if not xz_motor_control.conn_status:
    logging.ERROR("Connection to ClearCore not successful!")

species_map_filename = "species_map.json"

@app.get("/move_y_axis/{dist}")
async def move_y_axis(dist):
    print('Y: ' + dist)
    await y_motor_control.move_y(float(dist))

@app.get("/start_motor_hold")
def start_motor_hold():
    y_motor_control.start_motor_hold()

@app.get("/nudge_left")
def nudge_left():
    y_motor_control.set_turn('left')

@app.get("/nudge_right")
def nudge_right():
    y_motor_control.set_turn('right')

@app.get("/end_motor_hold")
def end_motor_hold():
    y_motor_control.end_motor_hold()

# x, and z distance in cm
# +x is left, -x is right
# +z is down, -z is up
@app.get("/move_xz_axis")
def move_xz_axis(x, z):
    return xz_motor_control.move_motors(x, z)


@app.get("/home_x")
def home_x():
    return xz_motor_control.home_x()


@app.get("/home_z")
def home_z():
    return xz_motor_control.home_z()


@app.get("/udp_update")
def update_udp_config(udp_ip, udp_port):
    xz_motor_control.update_config(udp_ip, udp_port)

@app.post("/saveConfig/")
async def save_config(request: Request):
    print("Save config")
    config = await request.json()
    config_file = from_here(species_map_filename)
    with open(config_file, "w") as json_file:
        json.dump(config, json_file)
    return config

@app.get("/loadConfig")
async def load_config():
    print("Load config")
    try:
        config_file = from_here(species_map_filename)
        with open(config_file, "r") as json_file:
            data = json.load(json_file)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")


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