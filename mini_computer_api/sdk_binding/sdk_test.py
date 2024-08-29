import time
# import SonyCam
from SonyCam import Camera

cam_obj = Camera()

isInit = cam_obj.initSDK()
if not isInit:
	exit(1)
else:
	print("Initialized SDK\n")

isConnected = cam_obj.connectCamera()
if not isConnected:
	exit(1)
else:
	print("Connected to camera\n")
	for i in range(5):
		cam_obj.clickPicture()
		print(f"Image taken: {i+1}")
	print("Disconnecting camera...\n")
	time.sleep(1)
	cam_obj.disconnectCamera()
