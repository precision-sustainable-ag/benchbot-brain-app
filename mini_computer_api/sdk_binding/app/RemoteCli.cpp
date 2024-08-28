#include <cstdint>
#include <filesystem>
namespace fs = std::filesystem;
#include <cstdlib>
#include <iomanip>
#include "CRSDK/CameraRemote_SDK.h"
#include "CameraDevice.h"
#include "Text.h"
#include <fstream>
#include <thread>
#include <chrono>

using namespace std::chrono_literals;
namespace SDK = SCRSDK;


class Sony_Camera{
private:
	typedef std::shared_ptr<cli::CameraDevice> CameraDevicePtr;
	CameraDevicePtr camera;

public:
	bool init_sdk(){
		auto init_success = SDK::Init();
		if (!init_success) {
			SDK::Release();
			return false;
		}
		return true;
	}

	bool connect_camera(){
		SDK::ICrEnumCameraObjectInfo* camera_list = nullptr;
		auto enum_status = SDK::EnumCameraObjects(&camera_list);
		if (CR_FAILED(enum_status) || camera_list == nullptr) {
			SDK::Release();
			return false;
		}
		auto* camera_info = camera_list->GetCameraObjectInfo(0);
		camera = CameraDevicePtr(new cli::CameraDevice(1, camera_info));
		return true;
	}

	void click_picture(){
		camera->connect(SDK::CrSdkControlMode_Remote, SDK::CrReconnecting_ON);
		camera->af_shutter();
		std::this_thread::sleep_for(5s);
	}

	void disconnect_camera(){
		camera->disconnect();
		camera->release();
		SDK::Release();
	}
};

int main()
{
	bool success;
	Sony_Camera cam_obj;
	
	success = cam_obj.init_sdk();
	if (!success)
		cli::tout << std::endl << "Failed to initialize SDK\n";

	success = cam_obj.connect_camera();
	if (!success)
		cli::tout << std::endl << "Failed to connect to a camera\n";
	else{
		cam_obj.click_picture();
		cli::tout << std::endl << "Will disconnect soon\n";
		std::this_thread::sleep_for(2s);
		cam_obj.disconnect_camera();
	}
}
