import SVCam
import time

SVCam.InitSDK()

cam_obj = SVCam.Camera(SVCam.findSystem())

cam_obj.deviceDiscovery()
isConnected = cam_obj.connectCamera()
if not isConnected:
    exit(1)
else:
    print("Found a camera connection\n")
    isStreamOpen = cam_obj.openStream()
    if isStreamOpen:
        print("Opened a stream\n")
        cam_obj.startAcquisition()
        for i in range(5):
            cam_obj.trigger()
            time.sleep(3)

        cam_obj.stopAcquisition()
    cam_obj.disconnectCamera()
