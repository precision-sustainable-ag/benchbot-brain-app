#include "camera.h"
#include "sv_gen_sdk.h"
#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <string>
#include <vector>
#include <cstring>

using namespace std;


// query all available interfaces
void Camera::enumInterface(){
    bool bChanged = false;
    // Update the internal list of available interfaces
    ret = SVSystemUpdateInterfaceList(g_hSystem, &bChanged, 1000);
    if (ret != SV_ERROR_SUCCESS)
    {
        printf("SVSystemUpdateInterfaceList failed! Error Code: %d\n", ret);
        return;
    }
    uint32_t numInterface = 0;
    // Query the number of available interfaces on this System module
    ret = SVSystemGetNumInterfaces(g_hSystem, &numInterface);
    if (ret != SV_ERROR_SUCCESS)
    {
        printf("SVSystemGetNumInterfaces failed! Error Code: %d\n", ret);
        return;
    }
    if (0 == numInterface)
    {
        printf("No Interface Available!\n");
        return;
    }

    for (uint32_t i = 0; i < numInterface; i++)
    {
        char interfaceId[SV_STRING_SIZE] = { 0 };
        size_t interfaceIdSize = sizeof(interfaceId);
        // Query the ID of the interface at index i in the internal interface list
        ret = SVSystemGetInterfaceId(g_hSystem, i, interfaceId, &interfaceIdSize);
        if (ret != SV_ERROR_SUCCESS)
        {
            printf("SVSystemGetInterfaceId failed! Error Code: %d\n", ret);
            continue;
        }
        SV_INTERFACE_INFO *interfaceInfo = new SV_INTERFACE_INFO();
        ret = SVSystemInterfaceGetInfo(g_hSystem, interfaceId, interfaceInfo);
        if (ret != SV_ERROR_SUCCESS)
        {
            printf("SVSystemInterfaceGetInfo failed! Error Code: %d\n", ret);
            continue;
        }
        InterfaceList.push_back(interfaceInfo);
    }
    return;
}


// query for all devices on all available interfaces
void Camera::enumDevices(const char * interfaceId){
    g_hInterface = NULL;
    bool bChanged = false;

    ret = SVSystemInterfaceOpen(g_hSystem, interfaceId, &g_hInterface);
    if (ret != SV_ERROR_SUCCESS)
    {
        printf("SVSystemInterfaceOpen failed! Error Code: %d\n", ret);
        return;
    }
    // Update the internal list of available devices on this interface.
    ret = SVInterfaceUpdateDeviceList(g_hInterface, &bChanged, 5000);
    if (ret != SV_ERROR_SUCCESS)
    {
        printf("SVInterfaceUpdateDeviceList failed! Error Code: %d\n", ret);
        return;
    }
    // Query the number of available devices on this interface
    uint32_t numDevices = 0;
    ret = SVInterfaceGetNumDevices(g_hInterface, &numDevices);
    if (ret != SV_ERROR_SUCCESS)
    {
        printf("SVInterfaceGetNumDevices failed! Error Code: %d\n", ret);
        SVInterfaceClose(g_hInterface);
        return;
    }
    if (0 == numDevices)
    {
        printf("No Device Connected on this interface!\n");
        SVInterfaceClose(g_hInterface);
        return;
    }
    // Get device info for all available devices and add it to the device info list
    for (uint32_t j = 0; j < numDevices; j++)
    {
            char deviceId[SV_STRING_SIZE] = { 0 };
            size_t deviceIdSize = sizeof(deviceId);
            ret = SVInterfaceGetDeviceId(g_hInterface, j, deviceId, &deviceIdSize);
            if (ret != SV_ERROR_SUCCESS)
            {
                printf("SVInterfaceGetDeviceId Failed! Error Code: %d\n", ret);
                continue;
            }
            SV_DEVICE_INFO *devInfo = new SV_DEVICE_INFO();
            ret = SVInterfaceDeviceGetInfo(g_hInterface, deviceId, devInfo);
            if (ret != SV_ERROR_SUCCESS)
            {
                printf("SVInterfaceDeviceGetInfo Failed! Error Code: %d\n", ret);
                delete devInfo;
                continue;
            }
            DeviceList.push_back(devInfo);
    }
    return;
}


void Camera::deviceDiscovery(){
    enumInterface();
    for (int j = 0; j < InterfaceList.size(); j++)
    {
        enumDevices(InterfaceList.at(j)->uid);
    }
}


bool Camera::connectCamera(){
    // find the first camera and establish connection to it
    if (DeviceList.empty())
        return false;
    SV_DEVICE_INFO devInfo = *DeviceList.front();
    SVInterfaceDeviceOpen(devInfo.hParentIF, devInfo.uid, SV_DEVICE_ACCESS_EXCLUSIVE, &g_hDevice, &g_hRemoteDevice);
    return true;
}


void Camera::disconnectCamera(){
    SVStreamClose(g_hStream);
    ret = SVDeviceClose(g_hDevice);
    if (ret != SV_ERROR_SUCCESS)
        printf("SVDeviceClose failed! Error Code: %d\n", ret);
}


bool Camera::openStream(){
    char streamId0[SV_STRING_SIZE] = {0};
    size_t streamId0Size = SV_STRING_SIZE;
    // retrieve the stream ID
    ret = SVDeviceGetStreamId(g_hDevice, 0, streamId0, &streamId0Size);
    if (ret != SV_ERROR_SUCCESS)
    {
        printf("SVDeviceGetStreamId Failed! Error Code: %d\n", ret);
        return false;
    }
    // open the streaming channel with the retrieved stream ID
    ret = SVDeviceStreamOpen(g_hDevice, streamId0, &g_hStream);
    if (ret != SV_ERROR_SUCCESS)
    {
        printf("SVDeviceStreamOpen Failed! Error Code: %d\n", ret);
        return false;
    }
    return true;
}


void Camera::startAcquisition(){
    ret = SVDeviceLoadSettings(g_hDevice, "camera_features.txt");
    if (ret != SV_ERROR_SUCCESS){
        printf("Failed to load camera settings from file! Error Code: %d\n", ret);
        return;
    }
}