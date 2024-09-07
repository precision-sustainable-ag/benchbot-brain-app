﻿#include <cstdint>
#include <filesystem>
namespace fs = std::filesystem;
#include <cstdlib>
#include <iomanip>
#include "Camera.h"
#include "CRSDK/CameraRemote_SDK.h"
#include "CameraDevice.h"
#include "Text.h"
#include <fstream>
#include <thread>
#include <chrono>

using namespace std::chrono_literals;
namespace SDK = SCRSDK;

namespace cli
{
bool init_sdk(){
	auto init_success = SDK::Init();
	if (!init_success) {
		cli::tout << "Failed to initialize Remote SDK. Terminating.\n";
		SDK::Release();
		return false;
	}
	return true;
}

bool connect_camera(){
	SDK::ICrEnumCameraObjectInfo* camera_list = nullptr;
	auto enum_status = SDK::EnumCameraObjects(&camera_list);
	if (CR_FAILED(enum_status))
		cli::tout << "CR Failure " << enum_status << "\n";
	else if (camera_list == nullptr)
		cli::tout << "Null pointer\n";
	if (CR_FAILED(enum_status) || camera_list == nullptr) {
		cli::tout << "No camera(s) detected. Connect a camera and retry.\n";
		SDK::Release();
		return false;
	}
	auto* camera_info = camera_list->GetCameraObjectInfo(0);
	camera = CameraDevicePtr(new cli::CameraDevice(1, camera_info));
	return true;
}

bool check_connection(){
	if (camera->is_connected())
		return true;
	else
		return false;
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
}