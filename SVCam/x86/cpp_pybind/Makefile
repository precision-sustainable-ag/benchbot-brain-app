# Set the compiler tools
CXX           = g++
CXXFLAGS      = -pipe -O2 -std=gnu++11 -Wall -Wextra
INCPATH       = -I..
LINK          = g++

# Compilation and linker flags
LFLAGS        = -Wl,-O1
LIBS          = -lpthread -L/opt/SVS/SVCamKit/SDK/Linux64_x64/ -lSVGenSDK64 -I/usr/local/include/opencv4/ -lopencv_core -lopencv_highgui -lopencv_imgcodecs -lopencv_imgproc

OBJECTS       = main.o camera.o
# The executable to build
TARGET        = CameraProgram

# The source files
SRC = main.cpp camera.cpp

# Set a default configuration if invoked with "make"
# CFG ?= release
# ifeq ($(CFG),debug)
# CFLAGS += -DDEBUG
# else
# CFLAGS += -03 -DNDEBUG
# endif

all: CameraProgram

CameraProgram:  $(OBJECTS)  
	$(LINK) $(LFLAGS) -o $(TARGET) $(OBJECTS) $(LIBS)

clean:
	-rm -f $(OBJECTS) $(TARGET)

main.o: main.cpp sv_gen_sdk.h
	$(CXX) -c $(CXXFLAGS) $(INCPATH) $(LIBS) -o main.o main.cpp

camera.o: camera.cpp sv_gen_sdk.h
	$(CXX) -c $(CXXFLAGS) $(INCPATH) $(LIBS) -o camera.o camera.cpp