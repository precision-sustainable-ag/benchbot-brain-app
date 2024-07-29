#include "sv_gen_sdk.h"
#define INFINITE 0xFFFFFFFF

class Camera {

private:
    SV_SYSTEM_HANDLE g_hSystem;
    SV_INTERFACE_HANDLE g_hInterface;
    SV_DEVICE_HANDLE g_hDevice;
    SV_REMOTE_DEVICE_HANDLE g_hRemoteDevice;
    SV_STREAM_HANDLE g_hStream;
    SV_RETURN ret;
    uint32_t buffer_count = 10;

public:
    // Constructor
    Camera(){
        // initialize the SVGenSDK
        string ctiPath ="/opt/SVS/SVCamKit/SDK/Linux64_ARM/cti";
        SV_RETURN ret = SVLibInit(ctiPath.c_str(), NULL, NULL, NULL);
        if (ret != SV_ERROR_SUCCESS)
        {
            printf("SDK Initialization failed! Error Code: %d", ret);
            throw ret;
        }
        g_hDevice = NULL;
        g_hRemoteDevice = NULL;
        g_hStream = NULL;
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

    void * AcquisitionThread(SV_STREAM_HANDLE context);
    void saveImages(SV_BUFFER_INFO imageBuffer);
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
    }
};


































#pragma once

#include <vector>
#include "sv_gen_sdk.h"
#include "SVCamFeature.h"
#include "SVCamAcquisition.h"

using namespace std;

class Camera
{
public:
    Camera(SV_DEVICE_INFO _devInfo )
    {
        devInfo = _devInfo;
        hDevice = NULL;
        hRemoteDevice = NULL;
        sv_cam_acq = NULL;
        sv_cam_feature= NULL;
        isInvalidateCB = false;
        
        //Open the device with device id (devInfo.uid) connected to the interface (devInfo.hParentIF)
        //Each camera contains acquisition instance for streaming and feature instance for controlling
        int Ret = SVInterfaceDeviceOpen(devInfo.hParentIF, devInfo.uid, SV_DEVICE_ACCESS_CONTROL, &hDevice, &hRemoteDevice);
        if (Ret == SV_ERROR_SUCCESS)
        {
            //New instances will be initialized only if the device is successfully opened.
            sv_cam_acq  = new SVCamAcquisition(hDevice,hRemoteDevice);
            sv_cam_feature = new SVCamFeature(hRemoteDevice);
        }
    }

    ~Camera()
    {
        printf("%s delete Camera instance:  %s\n", __FUNCTION__, devInfo.model);
        // Delete all related instances.
        if (sv_cam_acq)
        {
            printf("%s ==> delete acquisition  instance.   \n", __FUNCTION__);
            delete sv_cam_acq;
            sv_cam_acq = NULL;
        }
        if (sv_cam_feature)
        {
            printf("%s ==> delete Feature instance.  \n", __FUNCTION__ );
            delete sv_cam_feature;
            sv_cam_feature = NULL;
        }

        printf("%s ==> close device module.   \n", __FUNCTION__ );
        //Close the device module and free all the allocated resources.
        SVDeviceClose(hDevice);
        hDevice = NULL;
        hRemoteDevice = NULL;
        isInvalidateCB = false;
    }

    SVCamAcquisition *sv_cam_acq;
    SVCamFeature	*sv_cam_feature;
    SV_REMOTE_DEVICE_HANDLE hRemoteDevice;
    SV_DEVICE_INFO devInfo;
    SV_DEVICE_HANDLE hDevice;
    bool isInvalidateCB;
};

class SVCamSystem
{
public:
    SVCamSystem(SV_TL_INFO tl_info);
    ~SVCamSystem();
    bool SVCamSystemInit( uint32_t sysindex);
    void enumInterface(unsigned  int timeout);
    void EnumDevices(unsigned int timeout, const char * interfaceId);
    void deviceDiscovery(unsigned int timeout);
    void openDevice(SV_DEVICE_INFO devInfo);
    SV_RETURN closeDevice(SV_DEVICE_HANDLE hDev);
    vector<SV_DEVICE_INFO *>  devInfoList;
    vector<SV_INTERFACE_INFO *>  InterfInfoList;
    vector<Camera * > sv_cam_list;
    SV_TL_INFO sv_tl_inf;

private:
    SV_SYSTEM_HANDLE sv_cam_sys_hdl;
};
