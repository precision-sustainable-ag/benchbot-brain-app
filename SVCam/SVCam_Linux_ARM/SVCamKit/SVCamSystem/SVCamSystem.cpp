#include "SVCamSystem.h"


SVCamSystem::SVCamSystem(SV_TL_INFO tl_inf)
{
    sv_tl_inf = tl_inf;
    sv_cam_sys_hdl = NULL;
}

SVCamSystem::~SVCamSystem()
{
    // Delete all cameras in the list
    printf("%s delete all cameras. \n", __FUNCTION__);
    if (!sv_cam_list.empty())
        DSDeleteContainer(sv_cam_list);

    printf("%s Close all interfaces. \n", __FUNCTION__);

    // Close all interfaces and free all the resources allocated by this module
    if (!devInfoList.empty())
        for (vector<SV_DEVICE_INFO *>::iterator it = devInfoList.begin(); it != devInfoList.end(); ++it)
            if (*it)
            {
                SVInterfaceClose((*it)->hParentIF);
            }

    // Delete and clear all elements in the device info list
    if (devInfoList.size() != 0)
        DSDeleteContainer(devInfoList);

    // Delete and clear all elements in the Interface info list
    if (InterfInfoList.size() != 0)
        DSDeleteContainer(InterfInfoList);

    //Close system module and free all the resources
    printf("%s Close system module. \n", __FUNCTION__);
    if (sv_cam_sys_hdl)
    {
        SVSystemClose(sv_cam_sys_hdl);
        sv_cam_sys_hdl = NULL;
    }
}

bool  SVCamSystem::SVCamSystemInit( uint32_t Sysindex )
{
    /*
    Opens the System module and puts the instance in the phSystem handle. This allocates all system wide
    resources. A System module can only be opened once.
    */
    if (sv_cam_sys_hdl == NULL)
    {
        int ret = SVLibSystemOpen(Sysindex, & sv_cam_sys_hdl);
        if(SV_ERROR_SUCCESS != ret)
            return false;
    }
    return true;
}

void SVCamSystem::openDevice(SV_DEVICE_INFO devInfo)
{
    //Once the device is successfully opened an acquisition and feature instance are initialized and the new camera object is added to the camera list
    Camera* newCam = new Camera(devInfo);
    if (newCam->sv_cam_feature)
    {
        sv_cam_list.push_back(newCam);
    }
    else
    {
        delete newCam;
    }
}

SV_RETURN  SVCamSystem::closeDevice(SV_DEVICE_HANDLE hDevice )
{
    //Close the device module and frees all the resources allocated by this module.
    return SVDeviceClose( hDevice );
}

void SVCamSystem::deviceDiscovery(unsigned int timeout)
{
    enumInterface(timeout);
    for (int j = 0; j < InterfInfoList.size(); j++)
    {
        EnumDevices(timeout, InterfInfoList.at(j)->uid);
    }
}

void SVCamSystem::enumInterface(unsigned  int timeout)
{
    bool bChanged = false;
    //Updates the internal list of available interfaces.
    SV_RETURN ret = SVSystemUpdateInterfaceList(sv_cam_sys_hdl, &bChanged, timeout);
    if (SV_ERROR_SUCCESS != ret)
        return;

    uint32_t numInterface = 0;
    //Queries the number of available interfaces on this System module.
    ret = SVSystemGetNumInterfaces(sv_cam_sys_hdl, &numInterface);
    if (SV_ERROR_SUCCESS != ret)
    {
        printf(":%s SVSystemGetNumInterfaces failed!:%d\n", __FUNCTION__, ret);
        return;
    }
    
    for (uint32_t i = 0; i < numInterface; i++)
    {
        char interfaceId[SV_STRING_SIZE] = { 0 };
        size_t interfaceIdSize = sizeof(interfaceId);

        //Queries the ID of the interface at iIndex in the internal interface list .
        ret = SVSystemGetInterfaceId(sv_cam_sys_hdl, i, interfaceId, &interfaceIdSize);
        if (SV_ERROR_SUCCESS != ret)
        {
            printf(":%s SVSystemUpdateInterfaceList failed!:%d\n", __FUNCTION__, ret);
            continue;
        }
        // SV_INTERFACE_INFO interfaceInfo = { 0 };
        SV_INTERFACE_INFO *interfaceInfo = new SV_INTERFACE_INFO();

        ret = SVSystemInterfaceGetInfo(sv_cam_sys_hdl, interfaceId, interfaceInfo);
        if (SV_ERROR_SUCCESS != ret)
        {
            printf(":%s SVSystemInterfaceGetInfo failed!:%d\n", __FUNCTION__, ret);
            continue;
        }
        InterfInfoList.push_back(interfaceInfo);
    }
    return;
}

void SVCamSystem::EnumDevices(unsigned int timeout, const  char* interfaceId)
{
	SV_INTERFACE_HANDLE hInterface = NULL;
	bool bChanged = false;

	SV_RETURN ret = SVSystemInterfaceOpen(sv_cam_sys_hdl, interfaceId, &hInterface);
	if (SV_ERROR_SUCCESS != ret)
	{
		// printf(":%s  TL: %s  SVSystemInterfaceOpen failed!:%d \n", __FUNCTION__, sv_tl_inf.displayName, ret);
		return;
	}

	//Updates the internal list of available devices on this interface.
	ret = SVInterfaceUpdateDeviceList(hInterface, &bChanged, timeout);
	if (SV_ERROR_SUCCESS != ret)
	{
		//printf(":%s  TL: %s SVInterfaceUpdateDeviceList failed!:%d\n", __FUNCTION__, sv_tl_inf.displayName, ret);
		return;
	}

	//Queries the number of available devices on this interface
	uint32_t numDevices = 0;
	ret = SVInterfaceGetNumDevices(hInterface, &numDevices);
	if (SV_ERROR_SUCCESS != ret)
	{
		//printf(":%s  TL: %s  SVInterfaceGetNumDevices failed!:%d\n", __FUNCTION__, sv_tl_inf.displayName, ret);
		SVInterfaceClose(hInterface);
		return;
	}

	// Get device info for all available devices and add it to the device info list.
	for (uint32_t j = 0; j<numDevices; j++)
	{
		char deviceId[SV_STRING_SIZE] = { 0 };
		size_t deviceIdSize = sizeof(deviceId);
		ret = SVInterfaceGetDeviceId(hInterface, j, deviceId, &deviceIdSize);
		if (SV_ERROR_SUCCESS != ret)
		{
			//printf(":%s  TL: %s  SVInterfaceGetDeviceId Failed!:%d\n", __FUNCTION__, sv_tl_inf.displayName, ret);
			continue;
		}

		SV_DEVICE_INFO * devInfo = new   SV_DEVICE_INFO();
		ret = SVInterfaceDeviceGetInfo(hInterface, deviceId, devInfo);
		if (SV_ERROR_SUCCESS != ret)
		{
			//printf(":%s  TL: %s  SVInterfaceDeviceGetInfo Failed!:%d\n", __FUNCTION__, sv_tl_inf.displayName, ret);
			delete devInfo;
			continue;
		}
		devInfoList.push_back(devInfo);
	}
	return;
}
