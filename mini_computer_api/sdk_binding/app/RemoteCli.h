#ifndef REMOTECLI_H
#define REMOTECLI_H

#include "CameraDevice.h"
// #include "Text.h"

namespace SDK = SCRSDK;

class Sony_Camera{

private:
	typedef std::shared_ptr<cli::CameraDevice> CameraDevicePtr;
	CameraDevicePtr camera;

public:
    Sony_Camera();
	bool init_sdk();
	bool connect_camera();
    bool check_connection();
	void click_picture();
	void disconnect_camera();
};

#endif