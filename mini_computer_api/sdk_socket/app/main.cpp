#include <cstdint>
#include <cstdlib>
#include <fstream>
#include <thread>
#include <chrono>
#include <iostream>
#include "Camera.h"
using namespace std::chrono_literals;

#include <cstring> // For memset
#include <unistd.h> // For close
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PORT 8080
#define BUFFER_SIZE 1024



// bool send_message(std::string msg_string){

// }


int main() {
    int server_fd, new_socket, opt = 1;
    struct sockaddr_in address;
    int addrlen = sizeof(address);

    // Creating socket file descriptor
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

     // Set SO_REUSEADDR option
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        perror("setsockopt failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    // Define the address structure
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    // Bind the socket to the address
    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("bind failed");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    // Listen for incoming connections
    if (listen(server_fd, 3) < 0) {
        perror("listen");
        close(server_fd);
        exit(EXIT_FAILURE);
    }

    std::cout << "Waiting for connections on port " << PORT << "..." << std::endl;

    // Accept incoming connection
    if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen)) < 0) {
        perror("accept");
        close(server_fd);
        exit(EXIT_FAILURE);
    }
    std::cout << "Connection accepted \n" << std::endl;

    /*
        Camera Stuff
    */
    bool success;
	Sony_Camera cam_obj;

    try {
        do{
            char buffer[BUFFER_SIZE] = {0};
            // Read data from the client
            read(new_socket, buffer, BUFFER_SIZE);
            std::cout << "Received message: " << buffer << std::endl;
            if(strcmp(buffer, "Initialize_SDK") == 0){
                success = cam_obj.init_sdk();
                // Send a response to the client
                if (!success){
                    std::string reply_msg = "Fail";
                    send(new_socket, reply_msg.c_str(), reply_msg.size(), 0);
                }
                else{
                    std::string reply_msg = "Success";
                    send(new_socket, reply_msg.c_str(), reply_msg.size(), 0);
                }
            }
            else if (strcmp(buffer, "Camera_Connect")==0){
                success = cam_obj.connect_camera();
                // success = true;
                if (!success){
                    std::string reply_msg = "Fail";
                    send(new_socket, reply_msg.c_str(), reply_msg.size(), 0);
                }
                else{
                    std::string reply_msg = "Success";
                    send(new_socket, reply_msg.c_str(), reply_msg.size(), 0);
                }
            }
            else if (strcmp(buffer, "Camera_Status")==0){
                success = cam_obj.check_connection();
                std::cout << success << std::endl;
                // success = true;
                if (success){
                    std::string reply_msg = "Down";
                    send(new_socket, reply_msg.c_str(), reply_msg.size(), 0);
                }
                else{
                    std::string reply_msg = "Up";
                    send(new_socket, reply_msg.c_str(), reply_msg.size(), 0);
                }
            }
            else if (strcmp(buffer, "Camera_Trigger")==0){
                cam_obj.click_picture();
                std::string reply_msg = "Success";
                send(new_socket, reply_msg.c_str(), reply_msg.size(), 0);
            }
            else if (strcmp(buffer, "Camera_Disconnect")==0){
                cam_obj.disconnect_camera();
                std::string reply_msg = "Success";
                send(new_socket, reply_msg.c_str(), reply_msg.size(), 0);
            }
            else if (strcmp(buffer, "Close_Connection") == 0){
                throw "Close";
            }
            else{
                std::string reply_msg = "Not_Found";
                send(new_socket, reply_msg.c_str(), reply_msg.size(), 0);
            }
        }while(1);
    }
    catch(...) {
        // Close the socket
        close(new_socket);
        close(server_fd);
        std::cout << "Shutdown Server" << std::endl;
    }
    return 0;
}
