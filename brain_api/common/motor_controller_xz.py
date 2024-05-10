import json
import socket
from from_root import from_here
import logging
from fastapi import Response


from datetime import date
logfile = f"{date.today()}_server.log"
logging.basicConfig(filename=logfile, filemode="a", format="[ %(asctime)s ] %(message)s ", datefmt="%m-%d-%y %H:%M:%S", level=logging.INFO)


class MotorControllerXZ():
    def __init__(self):
        # x axis -> 0.003175 cm per enocoder count
        # z axis -> 0.00529167 cm per encoder count
        self.x_steps_to_cm = 0.003175
        self.z_steps_to_cm = 0.000529167
        self.conn_status = False

        self.config_file = from_here('udp_config.json')
        with open(self.config_file, 'r') as openfile:
            udp_info = json.load(openfile)
        ip = udp_info.get("ip")
        port = udp_info.get("port")
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.init_connection(ip, port)
 
    def update_config(self, new_ip, new_port):
        udp_config = {
            "ip": new_ip,
            "port": new_port,
        }
        json_obj = json.dumps(udp_config, indent=4)
        with open(self.config_file, 'w') as outfile:
            outfile.write(json_obj)
        logging.info(f"Updated UDP configuration [{new_ip}:{new_port}]")
        self.init_connection(new_ip, new_port)

    def init_connection(self, ip, port):
        self.server_socket.connect((ip, port))
        response_msg = self.move_motors(0, 0)
        if response_msg.status_code == 200:
            self.conn_status = True
            logging.info(f"UDP Connection successful with {ip}:{port}")
        else:
            logging.error(f"UDP Connection unsuccessful with {ip}:{port}")

    def send_message(self, msg_in):
        msgbyte = bytes(msg_in, 'ascii')
        self.server_socket.send(msgbyte)
        logging.info(f"Message {msg_in} sent")
        try:
            self.server_socket.settimeout(2)
            cc_reply = self.server_socket.recv(1024)
            msg_reply = cc_reply.decode()
            logging.info(f"Received reply: {msg_reply}")
            response = Response(content=msg_reply, status_code=200)
        except:
            msg_reply = "Error! No reply from clearcore server"
            logging.error(msg_reply)
            response = Response(content=msg_reply, status_code=417)
        return response
    
    def move_motors(self, x_val, z_val):
        x_counts = int(x_val) // self.x_steps_to_cm
        z_counts = int(z_val) // self.z_steps_to_cm
        message = f"X:{x_counts} Z:{z_counts}"
        return self.send_message(message)

    def home_x(self):
        message = "X:999 Z:0"
        return self.send_message(message)
    
    def home_z(self):
        message = "X:0 Z:999"
        return self.send_message(message)
