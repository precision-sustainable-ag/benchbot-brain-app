cmake_minimum_required(VERSION 3.22)
project( SVCam )

set(SOURCE_FILES
    src/camera.cpp)

link_directories(/opt/SVS/SVCamKit/SDK/Linux64_x64)

find_package( OpenCV REQUIRED )
include_directories( ${OpenCV_INCLUDE_DIRS} )

add_library(sv_cam STATIC src/camera.cpp)
set_target_properties(sv_cam PROPERTIES POSITION_INDEPENDENT_CODE ON)

add_subdirectory(pybind11)
pybind11_add_module( ${PROJECT_NAME} src/main.cpp)
target_link_libraries( ${PROJECT_NAME} PUBLIC ${OpenCV_LIBS} )
target_link_libraries( ${PROJECT_NAME} PUBLIC sv_cam )