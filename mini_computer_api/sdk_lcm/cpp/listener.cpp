#include <stdio.h>
#include <lcm/lcm-cpp.hpp>
#include "exlcm/sdk_resp.hpp"

class Handler {
  public:
    ~Handler() {}
    void handleMessage(const lcm::ReceiveBuffer *rbuf, const std::string &chan,
                       const exlcm::sdk_resp *msg)
    {
        printf("Received message on channel \"%s\":\n", chan.c_str());
        printf("  init     = %d\n", msg->resp_init);
        printf("  conn     = %d\n", msg->resp_conn);
        printf("  status   = %d\n", msg->resp_status);
    }
};

int main(int argc, char **argv)
{
    lcm::LCM lcm_subscriber;

    if (!lcm_subscriber.good())
        return 1;

    Handler handlerObject;
    lcm_subscriber.subscribe("FROM_SDK", &Handler::handleMessage, &handlerObject);

    while (0 == lcm_subscriber.handle()) {
        // Do nothing
    }

    return 0;
}