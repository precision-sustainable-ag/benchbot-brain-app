#!/bin/bash -x

# install npm dependencies
cd front_end/
npm i

# install python dependencies
cd ../
source venv/bin/activate
cd ./brain_api
pip install -r requirements.txt
