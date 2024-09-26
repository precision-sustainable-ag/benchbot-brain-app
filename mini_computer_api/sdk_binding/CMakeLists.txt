cmake_minimum_required(VERSION 3.22)

project(SonyCam)

### Append project cmake script dir ###
list(APPEND CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/cmake)

### Enumerate project files ###
include(enum_cli_hdr)
include(enum_cli_src)
include(enum_crsdk_hdr)

### Define output target ###
set(remotecli "CameraSDK")
add_library(${remotecli} SHARED
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

### Link CRSDK libraries
target_link_options(${remotecli} PRIVATE 
    -Wl,--no-as-needed
)
set(ldir ${CMAKE_CURRENT_SOURCE_DIR}/external)
set(cr_ldir ${ldir}/crsdk)

find_library(camera_remote Cr_Core HINTS ${cr_ldir})
message("${camera_remote}")

find_library(camera_remote_ptp Cr_PTP_USB HINTS ${cr_ldir}/CrAdapter)
message("${camera_remote_ptp}")

find_library(camera_remote_usb usb-1.0 HINTS ${cr_ldir}/CrAdapter)
message("${camera_remote_usb}")

target_link_libraries( ${remotecli} PRIVATE ${camera_remote} )
# target_link_libraries( ${remotecli} PRIVATE ${camera_remote_ptp} )
target_link_libraries( ${remotecli} PRIVATE ${camera_remote_usb} )


## Copy required library binaries
add_custom_command(TARGET ${remotecli} PRE_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory ${cr_ldir} $<TARGET_FILE_DIR:${remotecli}>
)
# include_directories(${cli_hdr_dir})
# include_directories(${crsdk_hdr_dir})


###################################################################################################3

add_subdirectory(pybind11)
find_package(pybind11 REQUIRED)
# set(PYBIND11_PYTHON_VERSION "3.12.4")
include_directories(${pybind11_INCLUDE_DIRS})

pybind11_add_module( ${PROJECT_NAME} app/main.cpp)

# Specify additional linker options
target_link_options(${PROJECT_NAME} PUBLIC 
    -Wl,--no-as-needed
)

target_link_libraries( ${PROJECT_NAME} PUBLIC ${remotecli} ${pybind11_LIBRARIES})


# target_link_libraries( ${PROJECT_NAME} PUBLIC ${pybind11_LIBRARIES} )
# target_link_libraries( ${PROJECT_NAME} PUBLIC ${remotecli} )
# target_link_libraries( ${PROJECT_NAME} PUBLIC ${camera_remote} )
# target_link_libraries( ${PROJECT_NAME} PUBLIC ${camera_remote_usb} )
# target_link_libraries( ${PROJECT_NAME} PUBLIC ${camera_remote_ptp} )

