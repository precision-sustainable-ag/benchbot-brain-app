cmake_minimum_required(VERSION 3.22)

project(SonyCam)

add_subdirectory(pybind11)
find_package(pybind11 REQUIRED)
include_directories(${pybind11_INCLUDE_DIRS})

### Append project cmake script dir ###
list(APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake)

### Enumerate project files ###
include(enum_cli_hdr)
include(enum_cli_src)
include(enum_crsdk_hdr)

### Define output target ###
set(remotecli "RemoteCli")
add_library(${remotecli} STATIC
    ${cli_hdrs}
    ${cli_srcs}
    ${crsdk_hdrs}
)
include_directories(${crsdk_hdr_dir})

### Link CRSDK library
set(ldir ${CMAKE_CURRENT_SOURCE_DIR}/external)
set(cr_ldir ${ldir}/crsdk)
find_library(camera_remote Cr_Core HINTS ${cr_ldir})

set_target_properties(${remotecli} PROPERTIES 
    POSITION_INDEPENDENT_CODE ON 
    ENABLE_EXPORTS YES
    LINK_FLAGS "-fPIC -shared"
)

target_compile_options(${remotecli}
    PRIVATE
        -fsigned-char
)


pybind11_add_module( ${PROJECT_NAME} app/main.cpp)
target_link_libraries( ${PROJECT_NAME} PRIVATE ${pybind11_LIBRARIES} )
target_link_libraries( ${PROJECT_NAME} PRIVATE ${camera_remote} )
target_link_libraries( ${PROJECT_NAME} PRIVATE ${remotecli} )
