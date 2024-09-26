import time
import lcm
from message import sdk_reqs, sdk_resp


# SUBSCRIBER
lcm_subscriber = lcm.LCM()

def my_handler(channel, data):
    msg = sdk_resp.decode(data)
    print(f"Received message on channel {channel}: {msg.resp}")

subscription = lcm_subscriber.subscribe("FROM_SDK", my_handler)



# PUBLISHER
lcm_publisher = lcm.LCM()
msg = sdk_reqs()
req_list = [5349, 4343, 4353, 4354, 4344, 5352]

# req_list = [5349, 4343]
# req_list = [4353, 4354]
# req_list = [4344, 5352]

for req_code in req_list:
    msg.req = req_code
    lcm_publisher.publish("TO_SDK", msg.encode())
    time.sleep(1)
    print(f"\nBack after {req_code}")
    lcm_subscriber.handle()
    
print("\n")