from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from from_root import from_root, from_here
from common.motors import Motors
from common.udp_conn import UDP_CONN
import uvicorn
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

amiga_motors = Motors()
clear_core = UDP_CONN()


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
    return clear_core.send_message(message)


@app.get("/home_x")
def home_x():
    message = "X:999 Z:0"
    return clear_core.send_message(message)


@app.get("/home_z")
def home_z():
    message = "X:0 Z:999"
    return clear_core.send_message(message)


@app.get("/udp_update")
def update_udp_config(udp_ip, udp_port):
    clear_core.update_config(udp_ip, udp_port)


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