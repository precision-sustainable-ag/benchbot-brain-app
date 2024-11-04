from flask import make_response, send_file
from from_root import from_root, from_here
from datetime import date
from pathlib import Path
import numpy as np
import os
import time
import shutil
import threading
import logging
import glob
import cv2
import io
import yaml
import json
import resources.SVCam as SVCam


im_height = 9528
im_width = 13376

with open(str(from_here('config.yaml')), 'r') as f:
    config_data = yaml.load(f, Loader=yaml.SafeLoader)

class CameraController():

    def __init__(self):
        # setup directory to save images
        self.location = config_data['state']
        parent_dir = "mini_computer_api"
        imgDir = f"images/{self.location}_{date.today()}"
        self.dirName = from_root(parent_dir, imgDir)
        self.create_img_dir = True
        self.cam_conn = False
        SVCam.InitSDK()

    def start_camera(self):
        self.cam_obj = SVCam.Camera(SVCam.findSystem())
        self.cam_obj.deviceDiscovery()
        isConnected = self.cam_obj.connectCamera()
        if isConnected:
            logging.info("Found a camera connection")
            self.cam_conn = True
            isStreamOpen = self.cam_obj.openStream()
            if isStreamOpen:
                logging.info("Opened a stream")
                self.cam_obj.startAcquisition()
        else:
            logging.info("No camera found")

    def stop_camera(self):
        try:
            self.cam_obj.stopAcquisition()
            self.cam_obj.disconnectCamera()
        except Exception as e:
            logging.error(e)
        finally:
            self.cam_conn = False
    
    # function for capturing a set of images and if successful, send a preview of the image captured
    def capture_images(self):
        try:
            self.camera_timer.cancel()
        except:
            pass
        if not self.cam_conn:
            self.start_camera()
        missing_list = self.trigger_camera()
        if not missing_list:
            response = self.encode_latest_image()
        else:
            message = ""
            for istr in missing_list:
                message += istr + " "
            message += "missing"
            imageCount = 2-len(missing_list)
            content = json.dumps({'text': message, 'imageTaken': imageCount})
            response = make_response(content, 417)
        return response


    # function for triggering the camera to take the images
    def trigger_camera(self):
        t_stamp = str(int(time.time()))
        try:
            self.cam_obj.trigger()
            time.sleep(2)
            self.img_array = self.cam_obj.fetchImage()
            cv2.imwrite(f"DSC_{t_stamp}.tiff", self.img_array)
        except Exception as e:
            self.img_array = np.arrray([])
            logging.error(e)
        finally:
            missing_images = self.find_and_rename_files(t_stamp)
            return missing_images

    # function to check whether both the image files have been downloaded from camera, if yes then rename them appropriately
    def find_and_rename_files(self, time_stamp):
        # missing_files = ["JPEG", "RAW"]
        missing_files = ["TIFF", "RAW", "BMP"]
        timeout_start = time.time()
        new_filename = f"{self.location}_{time_stamp}"
        while True:
            for file_name in os.listdir('.'):
                # if image file is found
                if file_name.startswith(config_data['cam_img_name']) and os.path.isfile(file_name):
                    if file_name.endswith('.tiff'):
                        new_name = new_filename + ".tiff"
                        to_remove = "TIFF"
                    elif file_name.endswith('.RAW'):
                        new_name = new_filename + ".RAW"
                        to_remove = "RAW"
                    elif file_name.endswith('.BMP'):
                        new_name = new_filename + ".BMP"
                        to_remove = "BMP"
                    try:
                        missing_files.remove(to_remove)
                        os.rename(file_name, new_name)
                        threading.Thread(target=self.move_files(new_name)).start()
                    except:
                        continue
                # if both images files are found or timeout occurs
                elif not missing_files or (time.time()-timeout_start > 5):
                    return missing_files


    # funtion to move image files to day's image collection directory
    def move_files(self, file_name):
        if self.create_img_dir:
            Path(self.dirName).mkdir(parents=True, exist_ok=True)
            self.create_img_dir = False
        try:
            shutil.move(file_name, self.dirName)
        except:
            return


    # function to find the latest jpeg file in the image directory
    def find_latest_image(self):
        list_of_files = glob.glob(f'{self.dirName}/*.BMP')
        fileName = None
        if list_of_files:
            fileName = max(list_of_files, key=os.path.getctime)
        return fileName

    # def create_preview_img(self):
    #     if self.img_array.size != 0:
    #         layer1 = self.img_array[:,:,0]
    #         nparray = layer1.reshape((int(im_height*im_width*1.5))).astype(np.uint16)
    #         nparray_16bit = np.empty(im_width*im_height, dtype=np.uint16)

    #         nparray_16bit[::2] = (nparray[::3] << 4) | (nparray[1::3] & 0b00001111)
    #         nparray_16bit[1::2] = nparray[2::3] | ((nparray[1::3] & 0b11110000) << 4)
    #         nparray_unpacked = nparray_16bit.reshape((im_height, im_width))<<4

    #         image_data = (nparray_unpacked).astype(np.float32)/65535.

    #         colour_image_gamma_adjusted = demosaicing_CFA_Bayer_Malvar2004(image_data, "RGGB")
    #         colour_image_gamma_adjusted[colour_image_gamma_adjusted<0] = 0
    #         colour_image_gamma_adjusted[colour_image_gamma_adjusted>1] = 1
                
    #         demosaiced = cv2.cvtColor(colour_image_gamma_adjusted.astype(np.float32), cv2.COLOR_RGB2BGR)
    #         img = (demosaiced*65535).astype(np.uint16)
    #         return img
    #     else:
    #         return None

    # function to encode latest jpeg file
    def encode_latest_image(self):
        img_file = self.find_latest_image()
        # image = self.create_preview_img()
        if img_file is not None:
            image = cv2.imread(img_file)
            preview = cv2.resize(image, None, fx = 0.1, fy = 0.1)
            _, img_encoded = cv2.imencode('.jpg', preview)
            byte_stream = img_encoded.tobytes()
            if byte_stream is None:
                response = make_response("Image encoding failed!", 400)
            else:
                response = make_response(send_file(io.BytesIO(byte_stream), download_name="preview.jpg", mimetype="image/jpeg"))
                response.status_code = 200
        else:
            response = make_response("No image file found!", 400)
        threading.Thread(target=self.remove_bmp(img_file)).start()
        self.camera_timer = threading.Thread(60, target=self.stop_camera).start()
        return response
    
    def remove_bmp(self, filename):
        try:
            os.remove(filename)
        except:
            pass

    def __del__(self):
        self.stop_camera()