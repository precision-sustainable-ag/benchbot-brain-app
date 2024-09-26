import time
import lcm
from message import sdk_reqs

lcm_publisher = lcm.LCM()
msg = sdk_reqs()
req_list = [5349, 4343, 4353, 4354, 4344, 5352]

for req_code in req_list:
    msg.req = req_code
    lcm_publisher.publish("TO_SDK", msg.encode())
    print(f"\nBack after {req_code}")
    time.sleep(1)
