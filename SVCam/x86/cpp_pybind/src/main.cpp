#include "camera.h"

#include <pybind11/pybind11.h>
namespace py = pybind11;


PYBIND11_MODULE(SVCam, m) {
    // optional module docstring
    m.doc() = "Python binding for camera SDK";

    m.def("InitSDK", &InitSDK, "function for initializing camera SDK");
    m.def("findSystem", &findSystem, "function for finding the system for the camera");

    py::class_<Camera>(m, "Camera")
        .def(py::init<SV_SYSTEM_HANDLE>())
        .def("deviceDiscovery", &Camera::deviceDiscovery)
        .def("connectCamera", &Camera::connectCamera)
        .def("disconnectCamera", &Camera::disconnectCamera)
        .def("openStream", &Camera::openStream)
        .def("startAcquisition", &Camera::startAcquisition)
        .def("trigger", &Camera::trigger)
        .def("stopAcquisition", &Camera::stopAcquisition);
        
}