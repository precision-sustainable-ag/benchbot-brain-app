#include <stdio.h>
#include <stdlib.h>
#include <string>
#include "camera.h"


int main ()
{
    // Camera* sv_cam = new Camera();
    string ctiPath ="/opt/SVS/SVCamKit/SDK/Linux64_ARM/cti";
    Camera sv_cam(ctiPath);

    sv_cam.deviceDiscovery();

    // bool isConnected = sv_cam->connectCamera();
    // if (!isConnected)
    //     return -1;

    // bool isStreamOpen = sv_cam->openStream();
    // if (!isStreamOpen)
    //     return -1;

    // sv_cam->startAcquisition();

    // sv_cam->stopAcquisition();
    // sv_cam->disconnectCamera();

    return(0);
}