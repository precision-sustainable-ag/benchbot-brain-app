import json
import socket
from from_root import from_here


class UDP_CONN():
    def __init__(self):
        self.config_file = from_here('udp_config.json')
        with open(self.config_file, 'r') as openfile:
            udp_info = json.load(openfile)
        self.ip = udp_info["ip"]
        self.port = udp_info["port"]
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.init_connection()
 
    def update_config(self, new_ip, new_port):
        udp_config = {
            "ip": new_ip,
            "port": new_port,
        }
        json_obj = json.dumps(udp_config, indent=4)
        with open(self.config_file, 'w') as outfile:
            outfile.write(json_obj)
        self.init_connection()

    def init_connection(self):
        try:
            # returns None value when connection not available, need to check what happens when connection is available
            rep = self.server_socket.connect((self.ip, self.port))
            print(rep)
            conn_status = True
        except:
            conn_status = False
        return conn_status

    def send_message(self, msg_in):
        msgbyte = bytes(msg_in, 'ascii')
        self.server_socket.send(msgbyte)
        try:
            self.server_socket.settimeout(2)
            msg_reply = self.server_socket.recv(1024)
        except:
            msg_reply = "Error! No reply from server"
        return msg_reply
