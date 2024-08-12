#include <iostream>
#include <string>
#include "camera.h"


int main(int argc, char**argv){
    printf("\nInitialisation...\n");
	bool bInitSuccessful = InitSDK();
    if (!bInitSuccessful)
        return -1;

    SV_SYSTEM_HANDLE gh_system = findSystem();
    if (gh_system){
        Camera sv_cam(gh_system);
        sv_cam.deviceDiscovery();
        bool isConnected = sv_cam.connectCamera();
        if (!isConnected)
            return -1;
        else
            printf("Found a camera connection\n");

        bool isStreamOpen = sv_cam.openStream();
        if (!isStreamOpen)
            return -1;
        else
            printf("Opened a stream\n");
        sv_cam.startAcquisition();
        sv_cam.stopAcquisition();
        sv_cam.disconnectCamera();
    }
    return 0;
}