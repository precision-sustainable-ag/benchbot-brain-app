import SVCam
import time
import cv2

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

        try:
            for i in range(2):
                cam_obj.trigger()
                time.sleep(2)
                img_array = cam_obj.fetchImage()
                cv2.imwrite(f"test_images/img_{time.time()}.tiff", img_array)
        except Exception as e:
            print(e)
        finally:
            cam_obj.stopAcquisition()
    cam_obj.disconnectCamera()
