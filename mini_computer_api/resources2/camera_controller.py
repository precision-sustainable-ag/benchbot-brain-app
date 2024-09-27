from flask import make_response, send_file
from from_root import from_root, from_here
from datetime import date
from pathlib import Path
import socket
import os
import time
import shutil
import threading
import glob
import cv2
import io
import yaml


with open(str(from_here('config.yaml')), 'r') as f:
    config_data = yaml.load(f, Loader=yaml.SafeLoader)

class CameraController():

    def __init__(self):
        # setup directory to save images
        self.location = config_data['state']
        parent_dir = "mini_computer_api"
        # imgDir = f"images/{self.location}/{date.today()}"
        imgDir = f"images/{self.location}_{date.today()}"
        self.dirName = from_root(parent_dir, imgDir)
        self.create_img_dir = True
        self.camera_client = SocketClient()
        # define the path to executable file of the camera
        # self.camera_exe_path = from_root(parent_dir, "resources", "RemoteCli")
        self.camera_exe_path = from_root(parent_dir, "sdk_socket", "build", "main")
        self.start_camera_server()

    def start_camera_server(self):
        # command = str(self.camera_exe_path) + " > /dev/null 2>&1 &"
        command = str(self.camera_exe_path) + " > out.txt 2>&1 &"
        # command = str(self.camera_exe_path) + " &"
        print(command)
        os.system(command)
        time.sleep(2)
        self.camera_client.init_connection()
        if self.camera_client.up():
            self.camera_client.cameraConnect()

    def stop_camera_server(self):
        # self.camera_client.cameraDisconnect()
        self.camera_client.shutdown_server()
        self.camera_client.close_connection()

    def restart_camera_server(self):
        self.stop_camera_server()
        self.start_camera_server()

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
        if self.camera_client.up():
            time.sleep(1)
            print(f"\ngone {time.time()}")
            self.camera_client.cameraTrigger()
            print(f"back {time.time()}")
            time.sleep(3)
        else:
            self.restart_camera_server()       
        t_stamp = str(int(time.time()))
        missing_images = self.find_and_rename_files(t_stamp)
        return missing_images

    # function to check whether both the image files have been downloaded from camera, if yes then rename them appropriately
    def find_and_rename_files(self, time_stamp):
        missing_files = ["JPEG", "RAW"]
        timeout_start = time.time()
        new_filename = f"{self.location}_{time_stamp}"
        while True:
            for file_name in os.listdir('.'):
                # if image file is found
                if file_name.startswith(config_data['cam_img_name']) and os.path.isfile(file_name):
                    if file_name.endswith('.JPG'):
                        new_name = new_filename + ".JPG"
                        to_remove = "JPEG"
                    elif file_name.endswith('.ARW'):
                        new_name = new_filename + ".ARW"
                        to_remove = "RAW"
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
        list_of_files = glob.glob(f'{self.dirName}/*.JPG')
        fileName = None
        if list_of_files:
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
                response = make_response("Image encoding failed!", 400)
            else:
                response = make_response(send_file(io.BytesIO(byte_stream), download_name="preview.jpg", mimetype="image/jpeg"))
                response.status_code = 200
        else:
            response = make_response("No image file found!", 400)
        return response

    def __del__(self):
        self.stop_camera_server()


class SocketClient():
    def __init__(self):
        # Define server address and port
        self.server_address = ('127.0.0.1', 8080)
        # Create a socket object
        self.client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.client_socket.settimeout(5.0)
        self.connection_status = False
    
    def init_connection(self):
        try:
            # Connect to the server
            self.client_socket.connect(self.server_address)
            print("\nConnected established")
            self.connection_status = True
        except ConnectionRefusedError:
            print("\nConnection refused")
            self.connection_status = False

    def close_connection(self):
        try:
            self.client_socket.close()
            print("\nConnection closed")
            self.connection_status = False
        except:
            pass

    def up(self):
        return self.connection_status

    def send_msg(self, message):
        try:
            self.client_socket.sendall(message.encode('utf-8'))
            print(f"\nSent message: {message}")
            response = self.client_socket.recv(1024)
            msg_decoded = response.decode('utf-8')
            print(f"Received response: {msg_decoded}")
        except:
            msg_decoded = ""
        return msg_decoded

    def cameraConnect(self):
        msg_reply = self.send_msg("Initialize_SDK")
        if(msg_reply=="Success"):
            msg_reply = self.send_msg("Camera_Connect")
            if(msg_reply=="Success"):
                print("\nCamera connected")
            else:
                print("\nCamera not connected")
        else:
            print("\nSDK not initialized")
    
    def cameraDisconnect(self):
        self.send_msg("Camera_Disconnect")

    def cameraStatus(self):
        msg_reply = self.send_msg("Camera_Status")
        if(msg_reply=="Up"):
            return True
        else:
            return False

    def cameraTrigger(self):
        self.send_msg("Camera_Trigger")
        time.sleep(5)
        # if self.cameraStatus():
        #     self.send_msg("Camera_Trigger")
        #     time.sleep(5)
        # else:
        #     print("\nNo trigger sent, camera not connected")

    def shutdown_server(self):
        self.send_msg("Close_Connection")
        self.connection_status = False




if __name__ == '__main__':
    sony_camera = CameraController()

    for i in range(5):
        try:
            sony_camera.capture_images()
        except RuntimeError as e:
            print(f"\n {e} \n")
        time.sleep(5)

    # sony_camera.stop_camera_server()