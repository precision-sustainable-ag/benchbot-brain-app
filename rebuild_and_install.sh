#!/bin/bash -x

# build the frontend in the ts directory
cd ts/
npm run build

# activate venv, install requirements, and run main.py 
cd ../
source venv/bin/activate
cd ./api
pip install -r requirements.txt
python main.py
