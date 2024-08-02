#include "camera.h"
#include "sv_gen_sdk.h"
#include <stdio.h>
#include <stdlib.h>
#include <chrono>
#include <thread>
#include <iostream>
#include <string>
#include <vector>
#include <cstring>

#define INFINITE 0xFFFFFFFF
using namespace std;

using namespace std::chrono;

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
    ret = SVDeviceClose(g_hDevice);
    if (ret != SV_ERROR_SUCCESS)
        printf("SVDeviceClose failed! Error Code: %d\n", ret);
}


void Camera::prepareAcquisitionBuffer(){
    SV_FEATURE_HANDLE hFeature = NULL;
    int64_t payloadSize = 0;
    SVFeatureGetByName(g_hRemoteDevice, "PayloadSize", &hFeature);
    SVFeatureGetValueInt64(g_hRemoteDevice, hFeature, &payloadSize);
    for (uint32_t i = 0; i<buffer_count; i++)
    {
        uint8_t *buffer = new uint8_t[(size_t)payloadSize];
        memset(buffer, 0, (size_t)payloadSize);

        SV_BUFFER_HANDLE hBuffer = NULL;
        ret = SVStreamAnnounceBuffer(g_hStream, buffer, (uint32_t)payloadSize, NULL, &hBuffer);
        if (ret != SV_ERROR_SUCCESS)
        {
            printf("SVStreamAnnounceBuffer [%d] Failed! Error Code: %d\n", i, ret);
            continue;
        }
        SVStreamQueueBuffer(g_hStream, hBuffer);
    }
    SVStreamFlushQueue(g_hStream, SV_ACQ_QUEUE_ALL_TO_INPUT);
}


void Camera::deleteBuffer(){
    for (uint32_t i = 0; i < buffer_count; i++)
    {
        SV_BUFFER_HANDLE hBuffer = NULL;
        uint8_t *pBuffer = NULL;
        SVStreamGetBufferId(g_hStream, 0, &hBuffer);
        if (hBuffer)
        {
            SVStreamRevokeBuffer(g_hStream, hBuffer, (void**)&pBuffer, NULL);
            if (pBuffer)
                delete [] pBuffer;
        }
    }
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
    
    std::thread  hThreadAcquisition(AcquisitionThread, g_hStream);
    hThreadAcquisition.detach();
    // acquisitionThread =  CreateThread(NULL, 0, AcquisitionThread, (void *)this, 0, NULL);
    prepareAcquisitionBuffer();

    ret = SVStreamAcquisitionStart(g_hStream, SV_ACQ_START_FLAGS_DEFAULT, GENTL_INFINITE);
    if (SV_ERROR_SUCCESS != ret)
    {
        printf("SVStreamAcquisitionStart Failed! Error Code: %d\n", ret);
        deleteBuffer();
        return;
    }

    SV_FEATURE_HANDLE hFeature = NULL;
    SVFeatureGetByName(g_hRemoteDevice, "TLParamsLocked", &hFeature);
    SVFeatureSetValueInt64(g_hRemoteDevice, hFeature, 1);
    hFeature = NULL;
    SVFeatureGetByName(g_hRemoteDevice, "AcquisitionStart", &hFeature);
    SVFeatureCommandExecute(g_hRemoteDevice, hFeature, 1000);
    hFeature = NULL;
    SVFeatureGetByName(g_hRemoteDevice, "TriggerSoftware", &hFeature);
    
    int triggerCounter = 5, trigger_freq = 2000;
    for (int i = 0; i < triggerCounter; i++)
    {
        SVFeatureCommandExecute(g_hRemoteDevice, hFeature, 1000, true);
        this_thread::sleep_for(std::chrono::milliseconds(trigger_freq));
    }
}


void * AcquisitionThread(SV_STREAM_HANDLE context){
    // hDS is g_hStream
    SV_STREAM_HANDLE hDS = (SV_STREAM_HANDLE)context;
    if (NULL == hDS)
        return nullptr;
    printf("\nAcquisitionThread Running...\n");
    while (true)
    {
        SV_BUFFER_HANDLE hBuffer = NULL;
        SV_RETURN ret = SVStreamWaitForNewBuffer(hDS, NULL, &hBuffer, 1000);
        if (SV_ERROR_SUCCESS == ret)
        {
            // query information of hBuffer on hStream
            SV_BUFFER_INFO bufferInfo = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
            ret = SVStreamBufferGetInfo(hDS, hBuffer, &bufferInfo);
            if (ret != SV_ERROR_SUCCESS)
            {
                printf("SVStreamBufferGetInfo Failed! Error Code: %d\n", ret);
                continue;
            }
            printf("Image Received Width:%zd Height:%zd Type:%ld \n", bufferInfo.iSizeX, bufferInfo.iSizeY, bufferInfo.iPixelType);
            
            auto start = high_resolution_clock::now();
            saveImages(bufferInfo);
            auto stop = high_resolution_clock::now();
            auto duration = duration_cast<milliseconds>(stop - start);
            printf("Time Taken: %ld\n", duration);

            // queue particular buffer for acquisition
            SVStreamQueueBuffer(hDS, hBuffer);
        }
        else if (SV_ERROR_TIMEOUT == ret)
            continue;
        else
            break;
    }
    return 0;
}


void saveImages(SV_BUFFER_INFO imageBuffer){
    string fileName3 = "NC_2024-07-23/img_" + to_string(imageBuffer.iTimeStamp) + ".BMP";
    SVUtilSaveImageToFile(imageBuffer, fileName3.c_str(), SV_IMAGE_FILE_BMP);
}


void Camera::stopAcquisition(){
    SV_FEATURE_HANDLE hFeature = NULL;
    uint32_t ExecuteTimeout = 1000;
    SVFeatureGetByName(g_hRemoteDevice, "AcquisitionStop", &hFeature);
    SVFeatureCommandExecute(g_hRemoteDevice, hFeature, ExecuteTimeout);

    hFeature = NULL;
    SVFeatureGetByName(g_hRemoteDevice, "TLParamsLocked", &hFeature);
    SVFeatureSetValueInt64(g_hRemoteDevice, hFeature, 0);

    SVStreamAcquisitionStop(g_hStream, SV_ACQ_STOP_FLAGS_DEFAULT);
    SVStreamFlushQueue(g_hStream, SV_ACQ_QUEUE_INPUT_TO_OUTPUT);
    SVStreamFlushQueue(g_hStream, SV_ACQ_QUEUE_OUTPUT_DISCARD);

    deleteBuffer();
    SVStreamClose(g_hStream);
}