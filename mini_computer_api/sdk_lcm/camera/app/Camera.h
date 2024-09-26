#ifndef CAMERA_H
#define CAMERA_H

#include <memory>

namespace cli {
	class CameraDevice;
}

typedef std::shared_ptr<cli::CameraDevice> CameraDevicePtr;

class Sony_Camera
{

private:
	CameraDevicePtr camera;
public:
	Sony_Camera();
	bool init_sdk();
	bool connect_camera();
	bool check_connection();
	void click_picture();
	void disconnect_camera();
	void release_sdk();
};

#endif