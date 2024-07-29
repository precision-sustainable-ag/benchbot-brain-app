#include <stdio.h>
#include <stdlib.h>
#include "camera.h"


int main ()
{
    Camera sv_cam();

    sv_cam.deviceDiscovery();

    bool isConnected = sv_cam.connectCamera();
    if (!isConnected)
        return -1;

    bool isStreamOpen = sv_cam.openStream();
    if (!isConnected)
        return -1;

    sv_cam.startAcquisition();

    sv_cam.stopAcquisition();
    sv_cam.disconnectCamera();

    return(0);
}