from flask import Flask
from from_root import from_root, from_here
from pathlib import Path
import os
import time
import shutil
import threading
from datetime import datetime
import logging

# create directory for saving day's images
STATE = 'NC'
dirName = from_here(f"Loc_{STATE}_{datetime.utcnow().strftime('%Y-%m-%d')}")
Path(dirName).mkdir(parents=True, exist_ok=True)

# define the path to executable file of the camera
CAM_PATH = from_here("resources/RemoteCli")

# setup the logging file and logging configurations
logfile = f"{datetime.utcnow().strftime('%Y-%m-%d')}_server_log.log"
logging.basicConfig(filename=logfile, filemode="a", format="[ %(asctime)s ] %(message)s ", datefmt="%m-%d-%y %H:%M:%S", level=logging.INFO)


app = Flask(__name__)


# funtion to move image files to day's image collection directory
def move_files():
    for file_name in os.listdir('.'):
        if file_name.startswith(STATE):
            shutil.move(file_name, dirName)


# function to check whether both the image files have been downloaded from camera, if yes then rename them appropriately
def check_files(time_stamp):
    missing_images = ["JPEG", "RAW"]
    ts = time.time()
    while True:
        for file_name in os.listdir('.'):
            # if image file is found
            if file_name.startswith(STATE):
                to_remove = None
                if file_name.endswith('.JPG'):
                    new_name = f"{STATE}_{time_stamp}.JPG"
                    to_remove = "JPEG"
                elif file_name.endswith('.ARW'):
                    new_name = f"{STATE}_{time_stamp}.ARW"
                    to_remove = "RAW"
                if to_remove is not None:
                    missing_images.remove(to_remove)
                try:
                    os.rename(file_name, new_name)
                except:
                    continue
            # if both images files are found or timeout occurs
            elif not missing_images or (time.time()-ts > 5):
                return missing_images


# route for helping debug, to check if server is running or not
@app.route('/', methods=['GET'])
def homepage():
    return 'Homepage, server is up and running', 200


# route for triggering the camera to take the images
@app.route('/image', methods=['GET'])
def capture_image():
    os.system(CAM_PATH)
    time.sleep(3)
    t_stamp = str(int(time.time()))
    missing_list = check_files(t_stamp)
    threading.Thread(target=move_files()).start()
    if not missing_list:
        message = "Images taken successfully"
        logging.info(message)
        return message, 200
    else:
        message = ""
        for istr in missing_list:
            message += istr + " "
        message += "missing"
        logging.info(message)
        return message, 417

 
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
