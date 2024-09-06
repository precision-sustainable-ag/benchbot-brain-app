#include <cstdint>
#include <cstdlib>
#include <fstream>
#include <thread>
#include <chrono>

#include "RemoteCli.h"
#include "CRSDK/CameraRemote_SDK.h"


using namespace std::chrono_literals;
namespace SDK = SCRSDK;


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