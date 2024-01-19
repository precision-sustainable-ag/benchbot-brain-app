# Mini Computer App

## Camera Setup

Run following commands to install required packages:
```
sudo apt-get update
sudo apt install autoconf libtool libudev-dev gcc g++ make cmake unzip libxml2-dev
```

The USDFS buffer size needs to be increased in order to have the camera operate successfully.
Follow these instructions for the same:

```
cd ~
# open /etc/default/grub file
sudo nano /etc/default/grub

# Find and replace
# GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
# with
# GRUB_CMDLINE_LINUX_DEFAULT="quiet splash usbcore.usbfs_memory_mb=150"

# then update grub
sudo update-grub
```


## Environment setup

Based on instructions on https://docs.conda.io/projects/miniconda/en/latest/.

Open a new terminal and run the following commands:

```
mkdir -p ~/miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm -rf ~/miniconda3/miniconda.sh
~/miniconda3/bin/conda init bash
```

Navigate to the mini_comp_api directory and then use these commands to create a new environment and install all required packages:
```
conda env create -f requirements.yml
# activate environment
conda activate api_env
```


## Launch on boot setup

The file setup.sh is used to activate the conda environment and get the server running. In order to have this file launched on boot up, follow these instructions:

First make the setup file executable by running

```
chmod +x setup.sh
# check if it executes by running
./setup.sh
```

Then create a service unit file for the script by creating a file bb_cam.service in /etc/systemd/system/ directory:
```
cd ~
sudo nano /etc/systemd/system/bb_cam.service
```

Add contents of bb_cam.txt to this file, make sure the ExecStart has the path to the script in your system.
Save the file and exit the text editor. Then run the following:

```
# Reload the systemd daemon to load the new service unit file
sudo systemctl daemon-reload
# Enable the service to start at boot
sudo systemctl enable bb_cam.service
# Start the service
sudo systemctl start bb_cam.service
```

The script will now be executed at startup.

<br>
<br>
<br>

------

For first time setup of Camera SDK, follow these instructions:

Use link https://support.d-imaging.sony.co.jp/app/sdk/en/index.html to download the Sony Camera SDK. Choose the "Linux® 64bit (x86)" option.

To get started run following commands:
```
sudo apt-get update
sudo apt install autoconf libtool libudev-dev gcc g++ make cmake unzip libxml2-dev
```

Go to the directory where the SDK got downloaded to and run the following:
```
unzip CrSDK_v1.11.00_20231107a_Linux64PC.zip
mkdir build
cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
cmake --build .
./RemoteCli
```