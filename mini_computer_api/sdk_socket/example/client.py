import socket
import time

def main():
    # Define server address and port
    server_address = ('127.0.0.1', 8080)
    
    # Create a socket object
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    
    try:
        # Connect to the server
        client_socket.connect(server_address)
        print("Connected to server")

        for i in range(3):
            # Send a message to the server
            message = "Trigger image"
            client_socket.sendall(message.encode('utf-8'))
            print(f"Sent message: {message}")

            # Receive a response from the server
            response = client_socket.recv(1024)
            print(f"Received response: {response.decode('utf-8')}")
            
            print("\n")
            time.sleep(3)
    
    finally:
        # Close the socket
        client_socket.close()
        print("Connection closed")

if __name__ == "__main__":
    main()
