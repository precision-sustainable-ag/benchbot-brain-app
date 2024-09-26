find_path(LCM_INCLUDE_DIR lcm/lcm.h
    PATHS /usr/local/include /usr/include
)

find_library(LCM_LIBRARY NAMES lcm
    PATHS /usr/local/lib /usr/lib
)


include(FindPackageHandleStandardArgs)
find_package_handle_standard_args(LCM DEFAULT_MSG LCM_LIBRARY LCM_INCLUDE_DIR)
# include(find_package(PackageHandleStandardArgs ))

mark_as_advanced(LCM_INCLUDE_DIR LCM_LIBRARY)