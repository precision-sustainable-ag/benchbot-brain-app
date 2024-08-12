cmake_minimum_required(VERSION 3.22)
project( SVCam )

add_subdirectory(pybind11)
find_package(pybind11 REQUIRED)
include_directories(${pybind11_INCLUDE_DIRS})
link_directories(/opt/SVS/SVCamKit/SDK/Linux64_x64)

find_package( OpenCV REQUIRED )
include_directories( ${OpenCV_INCLUDE_DIRS} )

add_library(sv_cam STATIC src/camera.cpp)
set_target_properties(sv_cam PROPERTIES POSITION_INDEPENDENT_CODE ON)

pybind11_add_module( ${PROJECT_NAME} src/main.cpp)
target_link_libraries( ${PROJECT_NAME} PUBLIC ${pybind11_LIBRARIES} )
target_link_libraries( ${PROJECT_NAME} PUBLIC sv_cam )
target_link_libraries( ${PROJECT_NAME} PUBLIC ${OpenCV_LIBS} )
target_link_libraries( ${PROJECT_NAME} PUBLIC SVGenSDK64 )