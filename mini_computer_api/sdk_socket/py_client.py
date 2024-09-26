import socket
import time


def send_msg(dest_server, message):
    dest_server.sendall(message.encode('utf-8'))
    print(f"\nSent message: {message}")
    response = dest_server.recv(1024)
    msg_decoded = response.decode('utf-8')
    print(f"Received response: {msg_decoded}")
    time.sleep(5)
    return msg_decoded

def main():
    # Define server address and port
    server_address = ('127.0.0.1', 8080)
    
    # Create a socket object
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.settimeout(5.0)
    try:
        # Connect to the server

        client_socket.connect(server_address)
        print("\nConnected to server")

        msg_reply = send_msg(client_socket, "Initialize_SDK")
        if(msg_reply=="Success"):
            msg_reply = send_msg(client_socket, "Camera_Connect")
            if(msg_reply=="Success"):
                for i in range(5):
                    msg_reply = send_msg(client_socket, "Camera_Status")
                    if(msg_reply=="Up"):
                        msg_reply = send_msg(client_socket, "Camera_Trigger")

        send_msg(client_socket, "Camera_Disconnect")
        # send_msg(client_socket, "Random")
        send_msg(client_socket, "Close_Connection")
    except ConnectionRefusedError:
        print("Connection refused")
    finally:
        # Close the socket
        client_socket.close()
        print("\nConnection closed")

if __name__ == "__main__":
    main()
