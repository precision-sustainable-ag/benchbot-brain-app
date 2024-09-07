cmake_minimum_required(VERSION 3.22)

project(main)

add_executable(${PROJECT_NAME} main.cpp)

set(ldir ${CMAKE_CURRENT_SOURCE_DIR}/../build)
find_library(camera_lib SonyCam HINTS ${ldir})
target_link_libraries(${PROJECT_NAME} PUBLIC ${camera_lib})
include_directories(${PROJECT_NAME} ./include/)
