#include "Camera.h"
#include <pybind11/pybind11.h>
namespace py = pybind11;

PYBIND11_MODULE(SonyCam, m) {
    m.doc() = "Python binding for SONY camera SDK";

    py::class_<Sony_Camera>(m, "Camera")
        .def(py::init<>())
        .def("initSDK", &Sony_Camera::init_sdk)
        .def("connectCamera", &Sony_Camera::connect_camera)
        .def("isConnected", &Sony_Camera::check_connection)
        .def("clickPicture", &Sony_Camera::click_picture)
        .def("disconnectCamera", &Sony_Camera::disconnect_camera);
}