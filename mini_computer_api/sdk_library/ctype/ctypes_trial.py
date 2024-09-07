from from_root import from_here
import ctypes
from ctypes import *
from sys import platform

# shared_lib_path = str(from_here("libCr_Core.so"))
main_lib_path = str(from_here("libSonyCam.so"))
try:
	# crsdk_lib = CDLL(shared_lib_path)
	# print("Successfully loaded", crsdk_lib)
	remote_lib = CDLL(main_lib_path)
	print("Successfully loaded", remote_lib)
except Exception as e:
	print(e)

# cInit = crsdk_lib.Init
# cInit.argtype = c_uint32
# cInit.restype = c_bool

# cRelease = crsdk_lib.Release
# cRelease.restype = c_bool


initSDK = remote_lib.init_sdk
initSDK.restype = c_bool

connectCamera = remote_lib.connect_camera
connectCamera.restype = c_bool

isConnected = remote_lib.check_connection
isConnected.restype = c_bool

clickPicture = remote_lib.click_picture
disconnectCamera = remote_lib.disconnect_camera

res = initSDK()
print(res)

print(connectCamera())

# print(isConnected())

# clickPicture()
# disconnectCamera()
