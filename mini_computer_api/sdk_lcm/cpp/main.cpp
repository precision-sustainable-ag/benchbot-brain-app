#include <lcm/lcm-cpp.hpp>
#include "exlcm/sdk_resp.hpp"

int main(int argc, char ** argv)
{
    lcm::LCM lcm_publisher;

    if(!lcm_publisher.good())
        return 1;

    /* Your application goes here */
    exlcm::sdk_resp sdk_reply;

    sdk_reply.resp_init = true;
    sdk_reply.resp_conn = false;
    sdk_reply.resp_status = false;
    
    lcm_publisher.publish("FROM_SDK", &sdk_reply);

    return 0;
}