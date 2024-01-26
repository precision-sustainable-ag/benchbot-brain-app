from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from from_root import from_root, from_here
from common.motor_controller_y import MotorControllerY
from common.motor_controller_xz import MotorControllerXZ
import uvicorn
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
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


@app.get("/move_y_axis/{dist}")
async def move_y_axis(dist):
    print('Y: ' + dist)
    await y_motor_control.move_y(float(dist))


# x, and z distance in cm
# +x is left, -x is right
# +z is down, -z is up
@app.get("/move_xz_axis")
def move_xz_axis(x, z):
    return xz_motor_control.move_motors(x, z)


@app.get("/home_x")
def home_x():
    return xz_motor_control.homing_x()


@app.get("/home_z")
def home_z():
    return xz_motor_control.homing_z()


@app.get("/udp_update")
def update_udp_config(udp_ip, udp_port):
    xz_motor_control.update_config(udp_ip, udp_port)


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