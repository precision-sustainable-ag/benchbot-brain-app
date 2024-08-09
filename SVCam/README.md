# SV Camera

[Official website](https://www.svs-vistek.com/en/industrial-cameras/svs-camera-detail.php?id=shr661CXGE)

------

## SDK Setup

To begin, install these packages:
```
sudo apt-get install g++
sudo apt-get install build-essential
```

The follow the quick user guide to install the camera sdk.

> NOTE: For ARM processor, the /others/svcamkit.conf should be corrected from 'Linux64_x64' to 'Linux64_ARM'.
> For switching between x64 and ARM, simply change the ctiPath in InitSDK().

<br>
Additional information for running SVCapture program:
* In guide lines 17 and 18 should be:
    * $chmod +x startSVCapture64.sh
    * $./startSVCapture64.sh
* First time usage, the driver might not be auto located so follow steps below:
    * In the camera discovery dialog, click on TL Settings.
    * The GenTL Manager dialog will enable you add the specific GenTL driver (most propable a *.cti file) location on the system to SVCapture.
* In case there is issue with program not being able to find shared libraries, refer [here](https://stackoverflow.com/questions/480764/linux-error-while-loading-shared-libraries-cannot-open-shared-object-file-no-s)

<br>

------

## Camera Operational Specs

**Pixel Formats**
* BayerRG8
* Mono8
* Mono12Packed
* BayerRG12Packed

**Util Saving Options**
* Bayer8 - Width:13392 Height:9528
    * BMP (383 MB, ~ 0.55s)
    * PNG (383 MB, ~ 5.35s)
    * RAW (127 MB, 0.1s ~ 0.3s)
<br>

------

## OpenCV

[Reference 1](https://docs.opencv.org/4.x/d7/d9f/tutorial_linux_install.html?ref=wasyresearch.com)
[Reference 2](https://www.geeksforgeeks.org/how-to-install-opencv-in-c-on-linux/)

```
# Install minimal prerequisites (Ubuntu 18.04 as reference)
sudo apt update && sudo apt install -y cmake g++ wget unzip

# Download and unpack sources
wget -O opencv.zip https://github.com/opencv/opencv/archive/4.x.zip
unzip opencv.zip

# Create build directory
mkdir -p build && cd build

# Configure
cmake  ../opencv-4.x
 
# Build
cmake --build .
```
<br>

------

## Pybind


```
cp SVCamKit/others/svcamkit.conf /etc/ld.so.conf.d
check
ldconfig


cp /etc/environment /etc/environment_`date +"%Y%m%d_%H%M%S"`
check
echo 'SVS_GENICAM_CACHE="/opt/SVS/SVCamKit/SDK/Linux64_x64/cache/"' >> /etc/environment
echo 'SVS_SDK_BIN_64="/opt/SVS/SVCamKit/SDK/Linux64_x64/"' >> /etc/environment
echo 'GENICAM_GENTL64_PATH="/opt/SVS/SVCamKit/SDK/Linux64_x64/cti"' >> /etc/environment
check

export LD_LIBRARY_PATH=/usr/local/lib/
```