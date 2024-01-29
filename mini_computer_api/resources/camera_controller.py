from flask import make_response, send_file
from from_root import from_root
from datetime import date
from pathlib import Path
import os
import time
import shutil
import threading
import glob
import cv2
import io
import logging


class CameraController():

    def __init__(self, state):
        # setup directory to save images
        self.location = state
        parent_dir = "mini_computer_api"
        imgDir = f"Loc_{self.location}_{date.today()}"
        self.dirName = from_root(parent_dir, imgDir)
        Path(self.dirName).mkdir(parents=True, exist_ok=True)

        # define the path to executable file of the camera
        self.camera_exe_path = from_root(parent_dir, "resources", "RemoteCli")


    # function for capturing a set of images and if successful, send a preview of the image captured
    def capture_images(self):
        missing_list = self.trigger_camera()
        if not missing_list:
            response = self.encode_latest_image()
        else:
            message = ""
            for istr in missing_list:
                message += istr + " "
            message += "missing"
            response = make_response(message, 417)
        return response


    # function for triggering the camera to take the images
    def trigger_camera(self):
        os.system(self.camera_exe_path)
        time.sleep(3)
        t_stamp = str(int(time.time()))
        missing_images = self.find_and_rename_files(t_stamp)
        threading.Thread(target=self.move_files()).start()
        return missing_images


    # function to check whether both the image files have been downloaded from camera, if yes then rename them appropriately
    def find_and_rename_files(self, time_stamp):
        missing_files = ["JPEG", "RAW"]
        timeout_start = time.time()
        new_filename = f"{self.location}_{time_stamp}"
        while True:
            for file_name in os.listdir('.'):
                # if image file is found
                if file_name.startswith(self.location):
                    if file_name.endswith('.JPG'):
                        new_name = new_filename + ".JPG"
                        to_remove = "JPEG"
                    elif file_name.endswith('.ARW'):
                        new_name = new_filename + ".ARW"
                        to_remove = "RAW"
                    try:
                        missing_files.remove(to_remove)
                    except:
                        pass
                    try:
                        os.rename(file_name, new_name)
                    except:
                        continue
                # if both images files are found or timeout occurs
                elif not missing_files or (time.time()-timeout_start > 5):
                    return missing_files


    # funtion to move image files to day's image collection directory
    def move_files(self):
        for file_name in os.listdir('.'):
            if file_name.startswith(self.location):
                try:
                    shutil.move(file_name, self.dirName)
                except:
                    continue


    # function to find the latest jpeg file in the image directory
    def find_latest_image(self):
        list_of_files = glob.glob(f'{self.location}/*.JPG')
        logging.DEBUG('\n', list_of_files, '\n')
        fileName = None
        if list_of_files is not None:
            fileName = max(list_of_files, key=os.path.getctime)
        return fileName


    # function to encode latest jpeg file
    def encode_latest_image(self):
        img_file = self.find_latest_image()
        if img_file is not None:
            image = cv2.imread(img_file)
            preview = cv2.resize(image, None, fx = 0.2, fy = 0.2)
            _, img_encoded = cv2.imencode('.jpg', preview)
            byte_stream = img_encoded.tobytes()
            if byte_stream is None:
                response = make_response("Image not available!", 400)
            else:
                logging.DEBUG('image encoded')
                response = make_response(send_file(io.BytesIO(byte_stream), download_name="preview.jpg", mimetype="image/jpeg"))
                response.status_code = 200
        else:
            response = make_response("No image file found!", 400)
        return response
