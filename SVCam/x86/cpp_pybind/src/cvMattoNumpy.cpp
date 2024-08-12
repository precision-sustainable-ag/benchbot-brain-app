#include <pybind11/pybind11.h>
#include <pybind11/numpy.h>
#include <opencv2/opencv.hpp>

namespace py = pybind11;

py::array_t<uchar> cvMatToNumpy(cv::Mat& mat) {
    // Create a NumPy array that shares the data with the OpenCV Mat
    return py::array_t<uchar>(
        {mat.rows, mat.cols, mat.channels()}, // shape
        {mat.step[0], mat.step[1], mat.elemSize()}, // strides
        mat.data // data pointer
    );
}

PYBIND11_MODULE(example, m) {
    m.def("cvMatToNumpy", &cvMatToNumpy, "Convert cv::Mat to NumPy ndarray");
}

// Explanation:
// Include Headers: Include the necessary headers for pybind11, numpy, and OpenCV.
// Namespace: Use the py namespace to access pybind11 functionality.
// cvMatToNumpy Function:
// Takes a cv::Mat as input.
// Creates a py::array_t<uchar> (NumPy array of unsigned chars) that shares the underlying data with the cv::Mat.
// Specifies the shape (rows, columns, channels), strides (how to move between elements), and data pointer of the cv::Mat.
// Returns the created NumPy array.
// PYBIND11_MODULE Macro:
// Defines a Python module named example.
// Exposes the cvMatToNumpy function to Python.






// https://stackoverflow.com/questions/26681713/convert-mat-to-array-vector-in-opencv

// std::vector<uchar> array;
// if (mat.isContinuous()) {
//   array.assign((uchar*)mat.datastart, (uchar*)mat.dataend);
// } else {
//   for (int i = 0; i < mat.rows; ++i) {
//     array.insert(array.end(), mat.ptr<uchar>(i), mat.ptr<uchar>(i)+mat.cols);
//   }
// }



// https://kiwix.ounapuu.ee/content/stackoverflow.com_en_all_2023-11/questions/72702026/pybind11-cv-mat-from-c-to-python

// py::array_t<uint8_t> flipcvMat(py::array_t<uint8_t>& img)
// {
//     auto rows = img.shape(0);
//     auto cols = img.shape(1);
//     auto channels = img.shape(2);
//     std::cout << "rows: " << rows << " cols: " << cols << " channels: " << channels << std::endl;
//     auto type = CV_8UC3;

//     cv::Mat cvimg2(rows, cols, type, (unsigned char*)img.data());

//     cv::Mat cvimg3(rows, cols, type);
//     cv::flip(cvimg2, cvimg3, 0);

//     cv::imwrite("/source/testout.png", cvimg3); // OK

//     py::array_t<uint8_t> output(
//                                 py::buffer_info(
//                                 cvimg3.data,
//                                 sizeof(uint8_t), //itemsize
//                                 py::format_descriptor<uint8_t>::format(),
//                                 3, // ndim
//                                 std::vector<size_t> {rows, cols , 3}, // shape
//                                 std::vector<size_t> { sizeof(uint8_t) * cols * 3, sizeof(uint8_t) * 3, sizeof(uint8_t)} // strides
//     )
//     );
//     return output;
// }