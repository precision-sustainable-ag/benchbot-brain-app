#include <cstdint>
#include <cstdlib>
#include <fstream>
#include <thread>
#include <chrono>
#include <iostream>

#include "Camera.h"

using namespace std::chrono_literals;


int main()
{
	bool success;
	Sony_Camera cam_obj;
	
	success = cam_obj.init_sdk();
	if (!success)
		std::cout << std::endl << "Failed to initialize SDK\n";

	success = cam_obj.connect_camera();
	if (!success)
		std::cout << std::endl << "Failed to connect to a camera\n";
	else{
		cam_obj.click_picture();
		std::cout << std::endl << "Will disconnect soon\n";
		std::this_thread::sleep_for(2s);
		cam_obj.disconnect_camera();
	}
}