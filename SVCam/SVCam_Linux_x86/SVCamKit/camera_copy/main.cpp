// #include <stdio.h>
// #include <stdlib.h>
#include <string>

#include "camera.h"
#include <stdio.h>
#include <tchar.h>
#include <vector>
#include <deque>
#include "sv_gen_sdk.h"

using namespace std;

SV_DEVICE_INFO devInfo;

bool InitSDK(string filepath){
    SV_RETURN ret = SVLibInit(filepath.c_str(), NULL, NULL, NULL);
    if (SV_ERROR_SUCCESS != ret)
    {
        printf("SDK Initialization failed! Error Code: %d", ret);
        return false;
    }
    return true;
}


SV_SYSTEM_HANDLE findSystem(){
    string ctiPath ="/opt/SVS/SVCamKit/SDK/Linux64_ARM/cti";
    printf("\nInitialisation...\n");
	bool bInitSuccessful = InitSDK(ctiPath);
    if (!bInitSuccessful)
        return;

    SV_SYSTEM_HANDLE cam_system;
    uint32_t tlCount = 0;
    SV_RETURN ret = SVLibSystemGetCount(&tlCount);
    printf("TL System Count %d\n", tlCount);
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
        printf("System type: %s\n", string(tlInfo.tlType));
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


int main (){
    // Camera* sv_cam = new Camera();
    // string ctiPath ="/opt/SVS/SVCamKit/SDK/Linux64_ARM/cti";
    // printf("\nInitialisation...\n");
	// bool bInitSuccessful = InitSDK(ctiPath);
    // if (!bInitSuccessful)
    //     return -1;
    


    SV_SYSTEM_HANDLE gh_system = findSystem();
    if (gh_system){
        Camera sv_cam(gh_system);
        sv_cam.deviceDiscovery();
    }
        

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