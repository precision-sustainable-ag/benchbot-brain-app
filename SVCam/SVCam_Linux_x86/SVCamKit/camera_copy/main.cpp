#include <iostream>
#include <string>
#include <vector>
#include <thread>
#include <cstring>
#include <chrono>
#include "sv_gen_sdk.h"
#include "camera.h"
#define INFINITE 0xFFFFFFFF
using namespace std;
using namespace std::chrono;


bool InitSDK()
{
    string ctiPath;
    ctiPath ="/opt/SVS/SVCamKit/SDK/Linux64_x64/cti";
    SV_RETURN ret = SVLibInit(ctiPath.c_str(), NULL, NULL, NULL);
    if (SV_ERROR_SUCCESS != ret)
    {
        printf("SVLibInit Failed! :%d", ret);
        return false;
    }
    return true;
}

SV_SYSTEM_HANDLE findSystem(){
    SV_SYSTEM_HANDLE cam_system;
    uint32_t tlCount = 0;
    SV_RETURN ret = SVLibSystemGetCount(&tlCount);
    if(tlCount==0)
        printf("Error! No systems found\n");
    bool bOpenGev = true;    
    for (uint32_t i = 0; i < tlCount; i++)
    {
        SV_TL_INFO tlInfo = { {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}};
        ret = SVLibSystemGetInfo(i, &tlInfo);
        if (ret != SV_ERROR_SUCCESS)
        {
            printf("SVLibSystemGetInfo Failed! Error Code: %d\n", ret);
            continue;
        }
        // printf("System type: %s\n", string(tlInfo.tlType));
        bool bOpenTL = false;
        if (bOpenGev &&  string("GEV") == string(tlInfo.tlType))
            bOpenTL = true;
        if (bOpenTL == false)
            continue;
        cam_system = NULL;
        ret = SVLibSystemOpen(i, &cam_system);
        if (ret != SV_ERROR_SUCCESS)
            printf("SVLibSystemOpen Failed! Error Code: %d\n", ret);
    }
    return cam_system;
}

int main(int argc, char**argv){
    printf("\nInitialisation...\n");
	bool bInitSuccessful = InitSDK();
    if (!bInitSuccessful)
        return -1;

    // uint32_t tlCount = 0;
    // SV_RETURN ret = SVLibSystemGetCount(&tlCount);
    // printf("TL System Count %d\n", tlCount);

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
        sv_cam.disconnectCamera();
    }

    // sv_cam->stopAcquisition();

    return 0;
}