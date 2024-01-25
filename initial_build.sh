#!/bin/bash -x

# create virtual environment for the backend in the api folder
cd brain_api/
python3 -m venv venv
source venv/bin/activate

# install dependencies
pip install --upgrade pip
python -m pip install --upgrade setuptools
pip install -r requirements.txt

# build the frontend in the front_end directory
cd ../front_end/
npm install
npm run build