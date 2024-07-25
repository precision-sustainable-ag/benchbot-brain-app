
#pragma once

#include <deque>
#include <vector>
#include "sv_gen_sdk.h"
using namespace std;


class SVCamAcquisition
{
public:

    SVCamAcquisition(SV_DEVICE_HANDLE _hDevice, SV_REMOTE_DEVICE_HANDLE _hRemoteDev);
    ~SVCamAcquisition();
    
    //open the Streaming channel with the given buffer count.
    void AcquisitionStart( size_t bufcount);

    /*
    close the streaming channel.
    the announced buffer will be removed from the acquisition engine
    */
    void AcquisitionStop();
    
    SV_GVSP_PIXEL_TYPE Get32bitPixelTyp(SV_GVSP_PIXEL_TYPE pixeltyp);
    uint64_t  getPayloadsize();
    int AcquisitionThread();

    HANDLE m_acquisitionThread;
    HANDLE m_acquisitionstopThread;
    HANDLE m_newImage;
    bool acqTerminated;
    int64_t payloadSize;
    size_t dsBufcount;
    deque<SV_BUFFER_INFO *> imageBufferInfo;

public:
    SV_DEVICE_HANDLE hDevice;
    SV_REMOTE_DEVICE_HANDLE hRemoteDev;
    SV_STREAM_HANDLE hDS;
    size_t ImagerWidth;
    size_t ImagerHeight;
    
private:
    CRITICAL_SECTION  csStream;

};
