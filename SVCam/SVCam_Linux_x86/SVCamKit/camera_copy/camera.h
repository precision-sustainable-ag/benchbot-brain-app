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
    // SV_TL_INFO g_hSystemInfo;
    SV_INTERFACE_HANDLE g_hInterface;
    SV_DEVICE_HANDLE g_hDevice;
    SV_REMOTE_DEVICE_HANDLE g_hRemoteDevice;
    SV_STREAM_HANDLE g_hStream;
    SV_RETURN ret;
    uint32_t buffer_count = 10;

public:
    // Constructor
    Camera(SV_SYSTEM_HANDLE cam_system){
        g_hDevice = NULL;
        g_hRemoteDevice = NULL;
        g_hStream = NULL;
        g_hSystem = cam_system;
    }
    
    vector<SV_INTERFACE_INFO *>  InterfaceList;
    vector<SV_DEVICE_INFO *>  DeviceList;

    void enumInterface();
    void enumDevices(const char * interfaceId);
    void deviceDiscovery();
    bool connectCamera();
    bool openStream();
    void startAcquisition();
    void disconnectCamera();

    // Destructor
    ~Camera(){
        SVInterfaceClose(g_hInterface);
        SVSystemClose(g_hSystem);
        SVLibClose();
        printf("Just done!\n");
    }
};


