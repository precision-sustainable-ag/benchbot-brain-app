# Mini Computer App

## Camera Setup





## Environment setup

Follow instructions on https://docs.conda.io/projects/miniconda/en/latest/ to download and install miniconda on Linux:

'''
mkdir -p ~/miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm -rf ~/miniconda3/miniconda.sh
~/miniconda3/bin/conda init bash
'''

The use these commands to create a new environment and install all required packages:
'''
conda env create -f requirements.yml
# activate environment
conda activate api_env
'''


## Launch on boot setup

The file setup.sh is used to activate the conda environment and get the server running. In order to have this file launched on boot up, follow these instructions:

First make the setup file executable by running

'''
chmod +x setup.sh
# check if it executes by running
./setup.sh
'''

Then create a service unit file for the script by creating a file bb_cam.service in /etc/systemd/system/ directory:
'''
cd ~
sudo nano /etc/systemd/system/bb_cam.service
'''

Add contents of bb_cam.txt to this file, make sure the ExecStart has the path to the script in your system.
Save the file and exit the text editor. Then run the following:

'''
# Reload the systemd daemon to load the new service unit file:
sudo systemctl daemon-reload
# Enable the service to start at boot:
sudo systemctl enable bb_cam.service
# Start the service:
sudo systemctl start bb_cam.service
'''

The script will now be executed at startup.



