cmake_minimum_required(VERSION 3.22)

project(SonyCam)

### Append project cmake script dir ###
list(APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake)

### Enumerate project files ###
include(enum_cli_hdr)
include(enum_cli_src)
include(enum_crsdk_hdr)

### Define output target ###
set(remotecli "${PROJECT_NAME}")
add_library(${remotecli} SHARED
    ${cli_hdrs}
    ${cli_srcs}
    ${crsdk_hdrs}
)

set(CMAKE_BUILD_RPATH "${CMAKE_CURRENT_SOURCE_DIR}/libs/CrAdapter")
message("${CMAKE_BUILD_RPATH}")

set_target_properties(${remotecli} PROPERTIES
    CXX_STANDARD 17
    CXX_STANDARD_REQUIRED YES
    CXX_EXTENSIONS NO
    POSITION_INDEPENDENT_CODE ON
    BUILD_RPATH "${CMAKE_BUILD_RPATH}"
    INSTALL_RPATH "${CMAKE_BUILD_RPATH}"
)

target_compile_options(${remotecli}
    PRIVATE
        -fsigned-char
)

target_include_directories(${remotecli}
    PRIVATE
        ${crsdk_hdr_dir} # defined in enum script
)


### Link CRSDK library
target_link_options(${remotecli} PRIVATE 
    -Wl,--no-as-needed
)
set(cr_ldir ${CMAKE_CURRENT_SOURCE_DIR}/libs)

find_library(camera_remote Cr_Core HINTS ${cr_ldir})
message("${camera_remote}")

find_library(camera_remote_usb usb-1.0 HINTS ${cr_ldir}/CrAdapter)
# find_library(camera_remote_usb usb-1.0 HINTS ${CMAKE_CURRENT_SOURCE_DIR}/build/CrAdapter)
message("${camera_remote_usb}")


target_link_libraries( ${remotecli} PRIVATE ${camera_remote} )
target_link_libraries( ${remotecli} PRIVATE ${camera_remote_usb} )


## Copy required library binaries
add_custom_command(TARGET ${remotecli} PRE_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory ${cr_ldir} $<TARGET_FILE_DIR:${remotecli}>
)

set(exe_file "main")
add_executable(${exe_file} ./app/main.cpp)

target_link_libraries(${exe_file} PUBLIC ${remotecli})
include_directories(${exe_file} ./app/)
