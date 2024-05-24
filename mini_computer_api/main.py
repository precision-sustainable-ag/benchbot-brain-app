from flask import Flask
from flask_cors import CORS
from resources.camera_controller import CameraController
from datetime import date
import logging
from from_root import from_here
from pathlib import Path


# setup the logging directory, file and logging configurations
log_dir = from_here("logs")
Path(log_dir).mkdir(parents=True, exist_ok=True)
log_file_path = log_dir / f"{date.today()}_server.log"
logfile = str(log_file_path)
logging.basicConfig(filename=logfile, filemode="a", format="[ %(asctime)s ] %(message)s ", datefmt="%m-%d-%y %H:%M:%S", level=logging.INFO)

STATE = 'MD'
sony_camera = CameraController(STATE)
app = Flask(__name__)
CORS(app)


# route for helping debug, to check if server is running or not
@app.route('/', methods=['GET'])
def homepage():
    return 'Homepage, server is up and running', 200


# route for capturing the image using the camera
@app.route('/image', methods=['GET'])
def capture_image():
    response_msg = sony_camera.capture_images()
    logging.info(response_msg)
    return response_msg


# route for providing preview of most recent image
@app.route('/image_latest', methods=['GET'])
def latest_jpeg_image():
    response_msg = sony_camera.encode_latest_image()
    logging.info(response_msg)
    return response_msg

 
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
