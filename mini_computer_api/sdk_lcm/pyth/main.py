import lcm
from exlcm import sdk_reqs

lcm_publisher = lcm.LCM()

msg = sdk_reqs()
msg.init_sdk = True
msg.cam_conn = True
msg.cam_status = False
msg.cam_trigger = True
msg.cam_disconn = False
msg.release_sdk = True

lcm_publisher.publish("TO_SDK", msg.encode())