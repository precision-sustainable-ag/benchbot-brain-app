cmake_minimum_required(VERSION 3.22)

project(SonyCam)

### Append project cmake script dir ###
list(APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake)

add_subdirectory(pybind11)
find_package(pybind11 REQUIRED)
set(PYBIND11_PYTHON_VERSION "3.12.4")
include_directories(${pybind11_INCLUDE_DIRS})

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

set_target_properties(${remotecli} PROPERTIES
    CXX_STANDARD 17
    CXX_STANDARD_REQUIRED YES
    CXX_EXTENSIONS NO
    POSITION_INDEPENDENT_CODE ON
)

target_compile_options(${remotecli}
    PRIVATE
        -fsigned-char
        -fPIC
)

target_include_directories(${remotecli}
    PRIVATE
        ${crsdk_hdr_dir} # defined in enum script
)


### Link CRSDK library
set(ldir ${CMAKE_CURRENT_SOURCE_DIR}/external)
set(cr_ldir ${ldir}/crsdk)
find_library(camera_remote Cr_Core HINTS ${cr_ldir})
target_link_libraries( ${remotecli} PRIVATE ${camera_remote} )

include_directories(${crsdk_hdr_dir})

pybind11_add_module( ${PROJECT_NAME} app/main.cpp)
target_link_libraries( ${PROJECT_NAME} PUBLIC ${pybind11_LIBRARIES} )
target_link_libraries( ${PROJECT_NAME} PUBLIC ${remotecli} )
