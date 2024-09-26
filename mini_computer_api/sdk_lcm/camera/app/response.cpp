#include <cstdint>
#include <cstdlib>
#include <fstream>
#include <thread>
#include <chrono>
#include <iostream>
#include "Camera.h"

#include <lcm/lcm-cpp.hpp>
#include "message/sdk_resp.hpp"
#include "message/sdk_reqs.hpp"

using namespace std::chrono_literals;


class Handler {
  public:
    lcm::LCM lcm_publisher;
    // if(!lcm_publisher.good())
    //     return 1;
    message::sdk_resp sdk_reply;
    Sony_Camera cam_obj;
    bool success;
    // Handler()
    // {
        
    // }

    ~Handler() {}

    void handleMessage(const lcm::ReceiveBuffer *rbuf, const std::string &chan,
                       const message::sdk_reqs *msg)
    {
        try{
            switch (msg->req) {
                case 5349: {
                    success = cam_obj.init_sdk();
                    sdk_reply.resp = (success) ? true : false;
                    break;
                }
                case 4343: {
                    success = cam_obj.connect_camera();
                    sdk_reply.resp = (success) ? true : false;
                    break;
                }
                case 4353: {
                    success = cam_obj.check_connection();
                    sdk_reply.resp = (success) ? true : false;
                    break;
                }
                case 4354:
                    cam_obj.click_picture();
                    sdk_reply.resp = true;
                    break;
                case 4344:
                    cam_obj.disconnect_camera();
                    sdk_reply.resp = true;
                    break;
                case 5352:
                    cam_obj.release_sdk();
                    sdk_reply.resp = true;
                    break;
                default:
                    std::cout << "Invalid request" << std::endl;
                    break;
            }
            lcm_publisher.publish("FROM_SDK", &sdk_reply);
        }
        catch(...){
            std::cout << "Error processing request!" << std::endl;
        }
    }
};


int main(int argc, char **argv)
{
    lcm::LCM lcm_subscriber;
    if (!lcm_subscriber.good())
        return 1;
    
    Handler handlerObject;
    lcm_subscriber.subscribe("TO_SDK", &Handler::handleMessage, &handlerObject);

    while (0 == lcm_subscriber.handle()) {
        // Do nothing
    }

    return 0;
}
