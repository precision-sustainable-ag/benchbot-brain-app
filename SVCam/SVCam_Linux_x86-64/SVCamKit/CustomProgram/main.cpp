#include <iostream>
#include <string>
#include <vector>
#include <thread>
#include <cstring>
#include <chrono>
#include "sv_gen_sdk.h"
#define INFINITE 0xFFFFFFFF
using namespace std;
using namespace std::chrono;

// global variable
SV_RETURN ret;
SV_SYSTEM_HANDLE g_hSystem;
SV_INTERFACE_HANDLE g_hInterface;
SV_DEVICE_HANDLE g_hDevice;
SV_REMOTE_DEVICE_HANDLE g_hRemoteDevice;
SV_STREAM_HANDLE g_hStream;
vector<SV_DEVICE_INFO> g_devInfoList;

#define HARDCODE_BUFFER_COUNT 10

// forward declaration
bool InitSDK();
void PrepareAcquisitionBuffer(SV_STREAM_HANDLE hDS, SV_REMOTE_DEVICE_HANDLE hRemoteDev);
bool findAndConnect();
bool openStream();
void setFeatures();
void startStreaming();
void cleanUp();
void unsetFeatures();
void stopStreaming();

void * AcquisitionThread(SV_STREAM_HANDLE context)
{
    // hDS is g_hStream
    SV_STREAM_HANDLE hDS = (SV_STREAM_HANDLE)context;
    if (NULL == hDS)
        return nullptr;

    printf("\nAcquisitionThread Running...\n");
    while (true)
    {
        SV_BUFFER_HANDLE hBuffer = NULL;
        // wait 1 sec for new buffer event
        SV_RETURN ret = SVStreamWaitForNewBuffer(hDS, NULL, &hBuffer, 1000);
        if (SV_ERROR_SUCCESS == ret)
        {
            // query information of hBuffer on hStream
            SV_BUFFER_INFO bufferInfo = { 0 };
            ret = SVStreamBufferGetInfo(hDS, hBuffer, &bufferInfo);
            if (SV_ERROR_SUCCESS != ret)
            {
                printf("%s SVStreamBufferGetInfo Failed!:%d\n", __FUNCTION__, ret);
                continue;
            }
            // printf("Image Received Width:%zd Height:%zd\n", bufferInfo.iSizeX, bufferInfo.iSizeY);
            
            auto start = high_resolution_clock::now();

            // string fileName1 = "NC_NC_07-25-2024/img_" + to_string(bufferInfo.iTimeStamp) + ".PNG";
            // SVUtilSaveImageToFile(bufferInfo, fileName1.c_str(), SV_IMAGE_FILE_PNG);
            // SVUtilSaveImageToPNGFile(bufferInfo, "image.PNG");

            // string fileName2 = "NC_NC_07-25-2024/img_" + to_string(bufferInfo.iTimeStamp) + ".ARW";
            // SVUtilSaveImageToFile(bufferInfo, fileName2.c_str(), SV_IMAGE_FILE_RAW);

            string fileName3 = "NC_07-25-2024/img_" + to_string(bufferInfo.iTimeStamp) + ".BMP";
            SVUtilSaveImageToFile(bufferInfo, fileName3.c_str(), SV_IMAGE_FILE_BMP);
            
            auto stop = high_resolution_clock::now();
            auto duration = duration_cast<milliseconds>(stop - start);
            printf("Time Taken: %ld\n", duration);
            // printf("----------------------------------------------\n");
            
            // queue particular buffer for acquisition
            SVStreamQueueBuffer(hDS, hBuffer);
            // this_thread::sleep_for(std::chrono::milliseconds(3500));
        }
        else if (SV_ERROR_TIMEOUT == ret)
        {
            // printf("Buffer TIMEOUT\n");
            continue;
        }
        else
        {
            // printf("Buffer EMPTY!\n");
            break;
        }
    }
    printf("AcquisitionThread End\n");
    return 0;
}


int main(int argc, char**argv)
{
    printf("Initialisation...\n");
    bool isInited = InitSDK();
    if (!isInited)
    {
        system("pause");
        return -1;
    }
    bool isConnected = findAndConnect();
    if (!isConnected)
    {
        cleanUp();
        return -1;
    }

    // Acq START
    bool isStreamOpen = openStream();
    if (!isConnected)
    {
        return -1;
    }
    startStreaming();

    // Acq STOP
    stopStreaming();
    return 0;
}


bool InitSDK()
{
    string ctiPath;
    ctiPath ="/opt/SVS/SVCamKit/SDK/Linux64_ARM/cti";
    SV_RETURN ret = SVLibInit(ctiPath.c_str(), NULL, NULL, NULL);
    if (SV_ERROR_SUCCESS != ret)
    {
        printf("SVLibInit Failed! :%d", ret);
        return false;
    }
    return true;
}


void PrepareAcquisitionBuffer(SV_STREAM_HANDLE hDS, SV_REMOTE_DEVICE_HANDLE hRemoteDev)
{
    SV_FEATURE_HANDLE hFeature = NULL;
    int64_t payloadSize = 0;

    SVFeatureGetByName(hRemoteDev, "PayloadSize", &hFeature);
    SVFeatureGetValueInt64(hRemoteDev, hFeature, &payloadSize);

    for (uint32_t i = 0; i<HARDCODE_BUFFER_COUNT; i++)
    {
        uint8_t *buffer = new uint8_t[(size_t)payloadSize];
        memset(buffer, 0, (size_t)payloadSize);

        SV_BUFFER_HANDLE hBuffer = NULL;
        SV_RETURN ret = SVStreamAnnounceBuffer(hDS, buffer, (uint32_t)payloadSize, NULL, &hBuffer);
        if (SV_ERROR_SUCCESS != ret)
        {
            printf(":%s SVStreamAnnounceBuffer[%d] Failed!:%d\n", __FUNCTION__, i, ret);
            continue;
        }

        SVStreamQueueBuffer(hDS, hBuffer);
    }

    SVStreamFlushQueue(hDS, SV_ACQ_QUEUE_ALL_TO_INPUT);
}


bool findAndConnect()
{
    //Get System
    uint32_t tlCount = 0;
    ret = SVLibSystemGetCount(&tlCount);
    bool bOpenGev = true;
    for (uint32_t i = 0; i < tlCount; i++)
    {
        SV_TL_INFO tlInfo = { {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}};
        ret = SVLibSystemGetInfo(i, &tlInfo);
        if (SV_ERROR_SUCCESS != ret)
        {
            printf("SVLibSystemGetInfo Failed! :%d\n", ret);
            continue;
        }
        bool bOpenTL = false;
        if (bOpenGev &&  string("GEV") == string(tlInfo.tlType))
            bOpenTL = true;
        if (false == bOpenTL)
            continue;
        g_hSystem = NULL;
        ret = SVLibSystemOpen(i, &g_hSystem);
        if (SV_ERROR_SUCCESS != ret)
            printf("SVLibSystemOpen Failed! :%d\n", ret);
    }

    //Get Interface(s)
    bool bChanged = false;
    SV_RETURN ret = SVSystemUpdateInterfaceList(g_hSystem, &bChanged, 1000);
    if (SV_ERROR_SUCCESS != ret)
    {
        printf("%s SVSystemUpdateInterfaceList failed!:%d\n", __FUNCTION__, ret);
        return false;
    }
    uint32_t numInterface = 0;
    ret = SVSystemGetNumInterfaces(g_hSystem, &numInterface);
    if (SV_ERROR_SUCCESS != ret)
    {
        printf("%s SVSystemGetNumInterfaces failed!:%d\n", __FUNCTION__, ret);
        return false;
    }
    if (0 == numInterface)
    {
        printf("%s No Interface Available!\n", __FUNCTION__);
        return false;
    }

    printf("*************Enumerate Interface****************\n");
    for (uint32_t i = 0; i < numInterface; i++)
    {
        char interfaceId[SV_STRING_SIZE] = { 0 };
        size_t interfaceIdSize = sizeof(interfaceId);
        ret = SVSystemGetInterfaceId(g_hSystem, i, interfaceId, &interfaceIdSize);
        if (SV_ERROR_SUCCESS != ret)
        {
            printf("%s SVSystemGetInterfaceId failed!:%d\n", __FUNCTION__, ret);
            continue;
        }
        SV_INTERFACE_INFO interfaceInfo = { {}, {}, {}, {}, {}, {}, {}};
        ret = SVSystemInterfaceGetInfo(g_hSystem, interfaceId, &interfaceInfo);
        if (SV_ERROR_SUCCESS != ret)
        {
            printf("%s SVSystemInterfaceGetInfo failed!:%d\n", __FUNCTION__, ret);
            continue;
        }
        printf("[%d] Interface Id:%s\n", i, interfaceId);
        g_hInterface = NULL;
        ret = SVSystemInterfaceOpen(g_hSystem, interfaceId, &g_hInterface);
        if (SV_ERROR_SUCCESS != ret)
        {
            printf("%s SVSystemInterfaceOpen failed!:%d\n", __FUNCTION__, ret);
            continue;
        }

        // Get Device
        ret = SVInterfaceUpdateDeviceList(g_hInterface, &bChanged, 5000);
        if (SV_ERROR_SUCCESS != ret)
        {
            printf("%s SVInterfaceUpdateDeviceList failed!:%d\n", __FUNCTION__, ret);
            continue;
        }
        uint32_t numDevices = 0;
        ret = SVInterfaceGetNumDevices(g_hInterface, &numDevices);
        if (SV_ERROR_SUCCESS != ret)
        {
            printf("%s SVInterfaceGetNumDevices failed!:%d\n", __FUNCTION__, ret);
            SVInterfaceClose(g_hInterface);
            continue;
        }
        if (0 == numDevices)
        {
            printf("%s No Device Connected!\n", __FUNCTION__);
            SVInterfaceClose(g_hInterface);
            continue;
        }

        for (uint32_t j = 0; j < numDevices; j++)
        {
            char deviceId[SV_STRING_SIZE] = { 0 };
            size_t deviceIdSize = sizeof(deviceId);
            ret = SVInterfaceGetDeviceId(g_hInterface, j, deviceId, &deviceIdSize);
            if (SV_ERROR_SUCCESS != ret)
            {
                printf("%s SVInterfaceGetDeviceId Failed!:%d\n", __FUNCTION__, ret);
                continue;
            }
            printf("\t[%d] device Id:%s\n", j, deviceId);
            SV_DEVICE_INFO devInfo = { {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}};
            ret = SVInterfaceDeviceGetInfo(g_hInterface, deviceId, &devInfo);
            if (SV_ERROR_SUCCESS != ret)
            {
                printf("%s SVInterfaceDeviceGetInfo Failed!:%d\n", __FUNCTION__, ret);
                continue;
            }
            g_devInfoList.push_back(devInfo);
        }
    }

    // choose a device and open it
    if (g_devInfoList.empty())
    {
        printf("No camera \n");
        return false;
    }
    SV_DEVICE_INFO devInfo = g_devInfoList.front();
    g_hDevice = NULL;
    g_hRemoteDevice = NULL;
    SVInterfaceDeviceOpen(devInfo.hParentIF, devInfo.uid, SV_DEVICE_ACCESS_EXCLUSIVE, &g_hDevice, &g_hRemoteDevice);
    return true;
}


bool openStream()
{
    char streamId0[SV_STRING_SIZE] = { 0 };
    size_t streamId0Size = SV_STRING_SIZE;
    ret = SVDeviceGetStreamId(g_hDevice, 0, streamId0, &streamId0Size);
    if (SV_ERROR_SUCCESS != ret)
    {
        printf("%s SVDeviceGetStreamId Failed!:%d\n", __FUNCTION__, ret);
        return false;
    }

    g_hStream = NULL;
    ret = SVDeviceStreamOpen(g_hDevice, streamId0, &g_hStream);
    if (SV_ERROR_SUCCESS != ret)
    {
        printf("%s SVDeviceStreamOpen Failed!:%d\n", __FUNCTION__, ret);
        return false;
    }
    return true;
}


void setFeatures()
{
    // SVDeviceLoadSettings(SV_DEVICE_HANDLE hDevice, const char *fileName);
    SV_FEATURE_HANDLE hFeature = NULL;
    SVFeatureGetByName(g_hRemoteDevice, "TriggerMode", &hFeature);
    SVFeatureSetValueInt64Enum(g_hRemoteDevice, hFeature, 1);

    hFeature = NULL;
    SVFeatureGetByName(g_hRemoteDevice, "AcquisitionFrameRate", &hFeature);
    SVFeatureSetValueFloat(g_hRemoteDevice, hFeature, 5.0f);

    // insert other feature set values

    hFeature = NULL;
    SVFeatureGetByName(g_hRemoteDevice, "TLParamsLocked", &hFeature);
    SVFeatureSetValueInt64(g_hRemoteDevice,hFeature, 1);

}


void startStreaming()
{
    setFeatures();
    std::thread  hThreadAcquisition(AcquisitionThread, g_hStream);
    hThreadAcquisition.detach();
    PrepareAcquisitionBuffer(g_hStream, g_hRemoteDevice);

    ret = SVStreamAcquisitionStart(g_hStream, SV_ACQ_START_FLAGS_DEFAULT, INFINITE);
    if (SV_ERROR_SUCCESS != ret)
    {
        printf("%s SVStreamAcquisitionStart Failed!:%d\n", __FUNCTION__, ret);
        return;
    }

    SV_FEATURE_HANDLE hFeature = NULL;
    SVFeatureGetByName(g_hRemoteDevice, "AcquisitionStart", &hFeature);
    SVFeatureCommandExecute(g_hRemoteDevice, hFeature, 1000);

    hFeature = NULL;
    SVFeatureGetByName(g_hRemoteDevice, "TriggerSoftware", &hFeature);

    // do 10 software triggers
    int triggerCounter = 0;
    for (int i = 0; i < 5; i++)
    {
        // printf("SoftwareTrigger:%d\n", triggerCounter++);
        SVFeatureCommandExecute(g_hRemoteDevice, hFeature, 1000, true);
        this_thread::sleep_for(std::chrono::milliseconds(2000)); // e.g. 1/fps
    }
    // printf("\nTriggers Done\n");
    // this_thread::sleep_for(std::chrono::milliseconds(2000));
}


void cleanUp()
{
    SVDeviceClose(g_hDevice);
    SVInterfaceClose(g_hInterface);
    SVSystemClose(g_hSystem);
    SVLibClose();
}


void unsetFeatures()
{
    SV_FEATURE_HANDLE hFeature = NULL;
    uint32_t ExecuteTimeout = 1000;
    SVFeatureGetByName(g_hRemoteDevice, "AcquisitionStop", &hFeature);
    SVFeatureCommandExecute(g_hRemoteDevice, hFeature, ExecuteTimeout);

    hFeature = NULL;
    SVFeatureGetByName(g_hRemoteDevice, "TLParamsLocked", &hFeature);
    SVFeatureSetValueInt64(g_hRemoteDevice, hFeature, 0);
}


void stopStreaming()
{
    unsetFeatures();
    SVStreamAcquisitionStop(g_hStream, SV_ACQ_STOP_FLAGS_DEFAULT);
    SVStreamFlushQueue(g_hStream, SV_ACQ_QUEUE_INPUT_TO_OUTPUT);
    SVStreamFlushQueue(g_hStream, SV_ACQ_QUEUE_OUTPUT_DISCARD);

    for (uint32_t i = 0; i < HARDCODE_BUFFER_COUNT; i++)
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

    SVStreamClose(g_hStream);
    cleanUp();
}
