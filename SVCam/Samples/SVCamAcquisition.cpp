#include "SVCamAcquisition.h" 
#include "ds_commonwin.h"


unsigned long __stdcall  SVCamThreadfunction(void *context)
{
    SVCamAcquisition * svcamAc =  (SVCamAcquisition * )context;
    if (svcamAc)
        svcamAc->AcquisitionThread();
    return 0;
}

int SVCamAcquisition::AcquisitionThread()
{
    while(!acqTerminated)
    {
        SV_BUFFER_HANDLE hBuffer = NULL;
        SV_RETURN ret = SVStreamWaitForNewBuffer(hDS, NULL, &hBuffer, 1000);
        if(SV_ERROR_SUCCESS == ret)
        {
            SV_BUFFER_INFO *bufferInfo = new SV_BUFFER_INFO();
            ret = SVStreamBufferGetInfo(hDS, hBuffer, bufferInfo);

            if(SV_ERROR_SUCCESS != ret)
            {
                delete bufferInfo;
                continue;
            }
            //Queues a particular buffer for acquisition.
            SVStreamQueueBuffer(hDS, hBuffer);

            if(imageBufferInfo.size() ==0 )
            {
                bufferInfo->iPixelType = Get32bitPixelTyp((SV_GVSP_PIXEL_TYPE)bufferInfo->iPixelType);
                imageBufferInfo.push_back(bufferInfo);
                SetEvent(m_newImage);
            }
            else
            {
                delete bufferInfo;
            }
        }
        else if(SV_ERROR_TIMEOUT == ret)
        {
            continue;
        }
    }

    ResetEvent(m_newImage);
    SetEvent(m_acquisitionstopThread);
    return 0;
}

SVCamAcquisition::SVCamAcquisition(SV_DEVICE_HANDLE _hDevice, SV_REMOTE_DEVICE_HANDLE _hRemoteDev)
{
    hDevice                 = _hDevice;
    hRemoteDev              = _hRemoteDev;
    payloadSize             = 0;
    dsBufcount              = NULL;
    hDS                     = NULL;
    m_acquisitionThread     = NULL;
    m_acquisitionstopThread = NULL;
    acqTerminated           = true;
    ImagerWidth             = 0;
    ImagerHeight            = 0;
    
    m_newImage =  CreateEvent(NULL, false, false, NULL);
    
    char streamId0[SV_STRING_SIZE] = {0};
    size_t streamId0Size = SV_STRING_SIZE;

    // retrieve the stream ID
    SV_RETURN ret = SVDeviceGetStreamId(hDevice, 0, streamId0, &streamId0Size);
    if(SV_ERROR_SUCCESS != ret)
    {
        printf(":%s SVDeviceGetStreamId Failed!:%d\n", __FUNCTION__, ret);
        return;
    }

    //open the Streaming channel with the retrieved stream ID
    ret = SVDeviceStreamOpen(hDevice, streamId0, &hDS);
    if(SV_ERROR_SUCCESS != ret)
    {
        printf(":%s SVDeviceStreamOpen Failed!:%d\n", __FUNCTION__, ret);
        return;
    }
}

SVCamAcquisition::~SVCamAcquisition()
{
    AcquisitionStop();
    SVStreamClose(hDS);
    DSDeleteContainer(imageBufferInfo);
}

void SVCamAcquisition::AcquisitionStart(size_t bufcount )
{
    if (acqTerminated)
    {
        dsBufcount =  bufcount;
        SV_FEATURE_HANDLE hFeature = NULL;
        SV_RETURN ret = SV_ERROR_UNKNOWN;
        payloadSize = getPayloadsize();

        // allocate buffers with the retrieved payload size.
        for(uint32_t i=0; i<bufcount; i++)
        {
            uint8_t*buffer = new uint8_t[(size_t)payloadSize];
            memset(buffer, 0, (size_t)payloadSize);
            
            SV_BUFFER_HANDLE hBuffer = NULL;
            // allocate memory to the Data Stream associated with the hStream
            ret = SVStreamAnnounceBuffer(hDS, buffer, (uint32_t)payloadSize, NULL, &hBuffer);
            if(SV_ERROR_SUCCESS != ret)
            {
                printf(":%s SVStreamAnnounceBuffer[%d] Failed!:%d\n", __FUNCTION__, i, ret);
                delete [] buffer;
                continue;
            }
            SVStreamQueueBuffer(hDS, hBuffer);
        }
        acqTerminated = false;
        m_acquisitionstopThread =  CreateEvent(NULL, false, false, NULL);
        m_acquisitionThread =  CreateThread(NULL, 0, SVCamThreadfunction, (void *)this, 0, NULL);
        SVStreamFlushQueue(hDS, SV_ACQ_QUEUE_ALL_TO_INPUT);
        ret = SVStreamAcquisitionStart(hDS, SV_ACQ_START_FLAGS_DEFAULT, GENTL_INFINITE);
        
        if(SV_ERROR_SUCCESS != ret)
        {
            printf(":%s SVStreamAcquisitionStart Failed!:%d\n", __FUNCTION__, ret);

            for(uint32_t i=0; i<bufcount; i++)
            {
                SV_BUFFER_HANDLE hBuffer = NULL;
                uint8_t *pBuffer = NULL;
                SVStreamGetBufferId(hDS,0, &hBuffer);
                if(hBuffer)
                {
                    SVStreamRevokeBuffer(hDS, hBuffer, (void**)&pBuffer, NULL);
                    if(pBuffer)
                        delete pBuffer;
                }
            }
        }

        hFeature = NULL;
        uint32_t ExecuteTimeout = 1000;
        SVFeatureGetByName(hRemoteDev, "AcquisitionStart", &hFeature);
        ret =  SVFeatureCommandExecute(hRemoteDev, hFeature, ExecuteTimeout);

        hFeature = NULL;
        SVFeatureGetByName(hRemoteDev, "TLParamsLocked", &hFeature);
        SVFeatureSetValueInt64(hRemoteDev,hFeature, 1);
    }
}

void SVCamAcquisition::AcquisitionStop()
{
    if (!acqTerminated)
    {
        acqTerminated = true;
        WaitForSingleObject(m_acquisitionstopThread, INFINITE);
        ResetEvent(m_acquisitionstopThread);
        if (m_acquisitionThread)
        {
            CloseHandle(m_acquisitionThread);
            m_acquisitionThread = NULL;
        }

        SV_FEATURE_HANDLE hFeature = NULL;
        uint32_t ExecuteTimeout = 1000;
        SVFeatureGetByName(hRemoteDev, "AcquisitionStop", &hFeature);
        SVFeatureCommandExecute(hRemoteDev, hFeature, ExecuteTimeout);

        hFeature = NULL;
        SVFeatureGetByName(hRemoteDev, "TLParamsLocked", &hFeature);
        SVFeatureSetValueInt64(hRemoteDev,hFeature, 0);

        SVStreamAcquisitionStop(hDS, SV_ACQ_STOP_FLAGS_DEFAULT);
        SVStreamFlushQueue(hDS, SV_ACQ_QUEUE_INPUT_TO_OUTPUT);
        SVStreamFlushQueue(hDS, SV_ACQ_QUEUE_OUTPUT_DISCARD);

        uint32_t bufferIdx = 0;
        for(uint32_t i=0; i< dsBufcount; i++)
        {
            SV_BUFFER_HANDLE hBuffer = NULL;
            uint8_t *pBuffer = NULL;
            int ret = SVStreamGetBufferId(hDS,0, &hBuffer);

            if(hBuffer)
            {
                SVStreamRevokeBuffer(hDS, hBuffer, (void**)&pBuffer, NULL);
                if(pBuffer)
                    delete pBuffer;
            }
        }
        DSDeleteContainer(imageBufferInfo);
    }
}

SV_GVSP_PIXEL_TYPE  SVCamAcquisition::Get32bitPixelTyp(SV_GVSP_PIXEL_TYPE pixeltyp)
{
    // check 16bitValue
    switch (pixeltyp)
    {
    // Mono buffer format defines
    case 0x0101:   return   SV_GVSP_PIX_MONO8;
    case 0x0102:   return   SV_GVSP_PIX_MONO10;
    case 0x0103:   return     SV_GVSP_PIX_MONO12;
    case 0x0105:   return    SV_GVSP_PIX_MONO16;
    
    // Bayer buffer format defines
    case 0x0311:   return    SV_GVSP_PIX_BAYGR8;
    case 0x0321:   return    SV_GVSP_PIX_BAYRG8;
    case 0x0331:   return   SV_GVSP_PIX_BAYGB8;
    case 0x0341:   return     SV_GVSP_PIX_BAYBG8;

    case 0x0312:   return     SV_GVSP_PIX_BAYGR10;
    case 0x0322:   return     SV_GVSP_PIX_BAYRG10;
    case 0x0332:   return     SV_GVSP_PIX_BAYGB10;
    case 0x0342:   return     SV_GVSP_PIX_BAYBG10;

    case 0x0313:   return    SV_GVSP_PIX_BAYGR12;
    case 0x0323:   return   SV_GVSP_PIX_BAYRG12;
    case 0x0333:   return    SV_GVSP_PIX_BAYGB12;
    case 0x0343:   return   SV_GVSP_PIX_BAYBG12;

    case 0x0315:   return    SV_GVSP_PIX_BAYGR16;
    case 0x0325:   return     SV_GVSP_PIX_BAYRG16;
    case 0x0335:   return     SV_GVSP_PIX_BAYGB16;
    case 0x0345:   return     SV_GVSP_PIX_BAYBG16;

    // Mono buffer format defines
    case  (int)SV_GVSP_PIX_MONO8:
    case  (int)SV_GVSP_PIX_MONO10:
    case  (int)SV_GVSP_PIX_MONO12:
    case  (int)SV_GVSP_PIX_MONO16:
    case  (int)SV_GVSP_PIX_MONO12_PACKED:

    // Bayer buffer format defines
    case  (int)SV_GVSP_PIX_BAYGR8:
    case (int)SV_GVSP_PIX_BAYRG8:
    case (int)SV_GVSP_PIX_BAYGB8:
    case (int)SV_GVSP_PIX_BAYBG8:
    case (int)SV_GVSP_PIX_BAYGR10:
    case (int)SV_GVSP_PIX_BAYRG10:
    case (int)SV_GVSP_PIX_BAYGB10:
    case (int)SV_GVSP_PIX_BAYBG10:
    case  (int)SV_GVSP_PIX_BAYGR12:
    case (int)SV_GVSP_PIX_BAYRG12:
    case (int)SV_GVSP_PIX_BAYGB12:
    case (int)SV_GVSP_PIX_BAYBG12:
    case (int)SV_GVSP_PIX_BAYGR12_PACKED:
    case (int)SV_GVSP_PIX_BAYRG12_PACKED:
    case (int)SV_GVSP_PIX_BAYGB12_PACKED:
    case (int)SV_GVSP_PIX_BAYBG12_PACKED:
    case (int)SV_GVSP_PIX_BAYGR16:
    case  (int)SV_GVSP_PIX_BAYRG16:
    case (int)SV_GVSP_PIX_BAYGB16:
    case (int)SV_GVSP_PIX_BAYBG16:
        return (SV_GVSP_PIXEL_TYPE)pixeltyp;
    default:
        return SV_GVSP_PIX_UNKNOWN;
    }
}

uint64_t  SVCamAcquisition::getPayloadsize()
{
    // retrieve the effective payload size from stream if it exists if not retrieve it from the remote device.
    uint64_t payloadSizeFinal = 0;
    SV_DS_INFO dsInfo = { 0 };
    SV_RETURN ret = SVStreamGetInfo(hDS, &dsInfo);
    SV_FEATURE_HANDLE hFeature = NULL;
    if (SV_ERROR_SUCCESS == ret)
    {
        if (dsInfo.isPayloadSizeDefined)
            payloadSizeFinal = dsInfo.payloadSize;
    }
    if (0 == payloadSizeFinal)
    {
        int64_t payloadSizeDS = 0;
        SVFeatureGetByName(hDS, "PayloadSize", &hFeature);
        SVFeatureGetValueInt64(hDS, hFeature, &payloadSizeDS);
        if (payloadSizeDS > 0)
            payloadSizeFinal = payloadSizeDS;
        else
        {
            int64_t payloadSizeRemoteDev = 0;
            //retrieve the payload size to allocate the buffers
            SVFeatureGetByName(hRemoteDev, "PayloadSize", &hFeature);
            SVFeatureGetValueInt64(hRemoteDev, hFeature, &payloadSizeRemoteDev);
            payloadSizeFinal = payloadSizeRemoteDev;
        }
    }
    return payloadSizeFinal;
}
