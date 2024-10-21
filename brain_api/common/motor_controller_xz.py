import yaml
import socket
from from_root import from_root
import logging


class MotorControllerXZ():
    def __init__(self):
        # x axis -> 0.003175 cm per enocoder count
        # z axis -> 0.00529167 cm per encoder count
        self.x_steps_to_cm = 0.003175
        self.z_steps_to_cm = 0.000529167
        self.conn_status = False

        self.config_file = from_root('config.yaml')
        with open(self.config_file, 'r') as openfile:
            self.config_data = yaml.load(openfile, Loader=yaml.SafeLoader)
            self.loc = self.config_data['state']
            udp_info = self.config_data[self.loc]['clear-core']
        ip = udp_info['ip']
        port = udp_info['port']
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.init_connection(ip, port)
 
    def update_config(self, new_ip, new_port):
        udp_config = {
            "ip": new_ip,
            "port": new_port,
        }
        self.config_data[self.loc]['clear-core'] = udp_config
        with open(self.config_file, 'w') as outfile:
            yaml.dump(self.config_data, outfile, default_flow_style=False)
        self.init_connection(new_ip, new_port)
        logging.info(f"Updated UDP configuration [{new_ip}:{new_port}]")

    def init_connection(self, ip, port):
        self.server_socket.connect((ip, port))
        response_msg = self.move_motors(0, 0)
        if "Error" not in response_msg:
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
        except:
            msg_reply = "Error! No reply from server"
            logging.error(msg_reply)
        return msg_reply
    
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
