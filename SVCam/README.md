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

> For switching between x64 and ARM, simply change the ctiPath in InitSDK() and in LIBS parameter of Makefile.

<br>

Additional information for running SVCapture program:
* In guide, lines 17 and 18 should be:
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
* BayerRG8 - SV_GVSP_PIX_BAYRG8 - Type:17301513
* Mono8 - SV_GVSP_PIX_MONO8 - Type:17301505
* Mono12Packed - SV_GVSP_PIX_MONO12_PACKED - Type:17563654
* BayerRG12Packed - SV_GVSP_PIX_BAYRG12_PACKED - Type:17563691

**Util Saving Options**
* Bayer8 - Width:13392 Height:9528
    * BMP (383 MB, ~ 0.55s)
    * PNG (383 MB, ~ 5.35s)
    * RAW (127 MB, 0.1s ~ 0.3s)
* Bayer12Packed - Width:13376 Height:9528
    * BMP
    * PNG
    * RAW
    * TIFF
<br>
