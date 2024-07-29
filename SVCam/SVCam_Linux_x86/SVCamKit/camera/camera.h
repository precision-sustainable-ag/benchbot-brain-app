#include <iostream>
#include <string>
#include <vector>
#include <thread>
#include <cstring>
#include "sv_gen_sdk.h"
#define INFINITE 0xFFFFFFFF
using namespace std;

class Camera {

private:
    SV_SYSTEM_HANDLE g_hSystem;

public:
    SV_INTERFACE_HANDLE g_hInterface;
    SV_DEVICE_HANDLE g_hDevice;
    SV_REMOTE_DEVICE_HANDLE g_hRemoteDevice;
    SV_STREAM_HANDLE g_hStream;
    SV_RETURN ret;
    uint32_t buffer_count = 10;

public:
    // Constructor
    Camera(string filepath){
        g_hDevice = NULL;
        g_hRemoteDevice = NULL;
        g_hStream = NULL;
        acqTerminated = false;
        // initialize the SVGenSDK
        ret = SVLibInit(filepath.c_str(), NULL, NULL, NULL);
        if (ret != SV_ERROR_SUCCESS)
        {
            printf("SDK Initialization failed! Error Code: %d", ret);
            throw ret;
        }
        printf("SDK Initialized (constructor)!\n");
        enumSystem();
    }
    
    vector<SV_INTERFACE_INFO *>  InterfaceList;
    vector<SV_DEVICE_INFO *>  DeviceList;

    void enumSystem();
    void enumInterface();
    void enumDevices(const char * interfaceId);
    void deviceDiscovery();
    bool connectCamera();
    void prepareAcquisitionBuffer();
    void deleteBuffer();
    bool openStream();

    void startAcquisition();
    
    // void * acquisitionThread;
    bool acqTerminated;
    
    
    void stopAcquisition();
    void disconnectCamera();

    // Destructor
    ~Camera(){
        // if (DeviceList.size() != 0)
        //     DSDeleteContainer(DeviceList);
        // if (InterfaceList.size() != 0)
        //     DSDeleteContainer(InterfaceList);
        SVInterfaceClose(g_hInterface);
        SVSystemClose(g_hSystem);
        SVLibClose();
        printf("Just done!\n");
    }
};

void * AcquisitionThread(SV_STREAM_HANDLE context);
void saveImages(SV_BUFFER_INFO imageBuffer);
