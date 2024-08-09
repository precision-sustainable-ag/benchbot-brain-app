project( SVCam )

find_package( OpenCV REQUIRED )
include_directories( ${OpenCV_INCLUDE_DIRS} )
target_link_libraries( ${PROJECT_NAME} ${OpenCV_LIBS} )

add_library(sv_cam STATIC src/camera.cpp)
set_target_properties(sv_cam PROPERTIES POSITION_INDEPENDENT_CODE ON)

set(SOURCE_FILES
    src/main.cpp)
add_executable( ${PROJECT_NAME} ${SOURCE_FILES} )

add_subdirectory( pybind11 )
pybind11_add_module( SVCam  src/main.cpp )
target_link_libraries( SVCam PRIVATE sv_cam)