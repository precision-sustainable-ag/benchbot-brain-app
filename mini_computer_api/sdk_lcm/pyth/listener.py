import lcm
from exlcm import sdk_reqs

def my_handler(channel, data):
    msg = sdk_reqs.decode(data)
    print("Received message on channel \"%s\"" % channel)
    print("   init sdk      = %s" % msg.init_sdk)
    print("   cam conn      = %s" % msg.cam_conn)
    print("   cam status    = %s" % msg.cam_status)
    print("   cam trigger   = %s" % msg.cam_trigger)
    print("   cam disconn   = %s" % msg.cam_disconn)
    print("   release sdk   = %s" % msg.release_sdk)

lcm_subscriber = lcm.LCM()
subscription = lcm_subscriber.subscribe("TO_SDK", my_handler)

try:
    while True:
        lcm_subscriber.handle()
except KeyboardInterrupt:
    pass