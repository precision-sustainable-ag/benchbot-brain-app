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

set_target_properties(${remotecli} PROPERTIES
    CXX_STANDARD 17
    CXX_STANDARD_REQUIRED YES
    CXX_EXTENSIONS NO
    BUILD_RPATH "$ORIGIN"
    INSTALL_RPATH "$ORIGIN"
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
set(ldir ${CMAKE_CURRENT_SOURCE_DIR}/external)
set(cr_ldir ${ldir}/crsdk)
find_library(camera_remote Cr_Core HINTS ${cr_ldir})
target_link_libraries( ${remotecli} PRIVATE ${camera_remote} )

## Copy required library binaries
add_custom_command(TARGET ${remotecli} PRE_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory ${cr_ldir} $<TARGET_FILE_DIR:${remotecli}>
)

add_executable(main ./src/main.cpp)
target_link_libraries(main PUBLIC ${remotecli})
include_directories(main ./app/)

