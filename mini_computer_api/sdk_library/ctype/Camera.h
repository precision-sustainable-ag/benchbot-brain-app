#ifndef CAMERA_H
#define CAMERA_H

#include "CameraDevice.h"

namespace cli
{

typedef std::shared_ptr<CameraDevice> CameraDevicePtr;
CameraDevicePtr camera;

extern "C"
bool init_sdk();
extern "C"
bool connect_camera();
extern "C"
bool check_connection();
extern "C"
void click_picture();
extern "C"
void disconnect_camera();

}	// namespace cli

#endif