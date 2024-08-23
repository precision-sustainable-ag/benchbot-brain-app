# Libraries

## OpenCV

[Reference 1](https://docs.opencv.org/4.x/d7/d9f/tutorial_linux_install.html?ref=wasyresearch.com)

```
# Install minimal prerequisites (Ubuntu 18.04 as reference)
sudo apt update && sudo apt install -y cmake g++ wget unzip

# Download and unpack sources
wget -O opencv.zip https://github.com/opencv/opencv/archive/4.x.zip
unzip opencv.zip

# Create build directory
mkdir -p build && cd build

# Configure
cmake  ../opencv-4.x
 
# Build
cmake --build .
```
<br>

[Reference 2](https://www.geeksforgeeks.org/how-to-install-opencv-in-c-on-linux/)

```
# Install prerequisites
sudo apt install -y g++ cmake make git libgtk2.0-dev pkg-config

# Download the source
git clone https://github.com/opencv/opencv.git

# Build the source
mkdir -p build && cd build
cmake ../OpenCV
make -j4

# Install teh OpenCV package
sudo make install
```
<br>

------

## Pybind

[Main Repository](https://github.com/pybind/pybind11) &nbsp;
[cmake_example](https://github.com/pybind/cmake_example)

[Installing the library](https://pybind11.readthedocs.io/en/stable/installing.html) &nbsp;
[Getting Started](https://pybind11.readthedocs.io/en/stable/basics.html)

```
# Install Python dev package (use right package version)
sudo apt-get install python3.5-dev
```

<br>

Project setup for building python module:
* In directory cpp_pybind, clone the main pybind11 repository.
* Then run the following:
    ```
    mkdir build && cd build
    cmake ..
    make sv_cam
    make SVCam
    ```
* This should produce a file in build directory with a name like "SVCam.cpython-312-x86_64-linux-gnu.so" which can then be used as a module import in python.

