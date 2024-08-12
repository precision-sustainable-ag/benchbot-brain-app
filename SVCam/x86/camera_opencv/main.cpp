#include <iostream>
#include <string>
#include <chrono>
#include <thread>
#include "camera.h"

using namespace std;
using namespace std::chrono;

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
        
        int triggerCounter = 2, trigger_freq = 5000;
        for (int i = 0; i < triggerCounter; i++)
        {
            sv_cam.trigger();
            this_thread::sleep_for(std::chrono::milliseconds(trigger_freq));
        }
        this_thread::sleep_for(std::chrono::milliseconds(10000));

        sv_cam.stopAcquisition();
        sv_cam.disconnectCamera();
    }
    return 0;
}