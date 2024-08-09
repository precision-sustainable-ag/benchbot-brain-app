import SVCam


SVCam.InitSDK()

cam_obj = SVCam.Camera(SVCam.findSystem())

cam_obj.deviceDiscovery()
isConnected = cam_obj.connectCamera()
if not isConnected:
    exit(1)
else:
    print("Found a camera connection\n")

cam_obj.disconnectCamera()

