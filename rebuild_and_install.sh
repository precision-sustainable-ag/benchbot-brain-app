#!/bin/bash -x

# build the frontend in the ts directory
cd ts/
npm run build

# activate venv, install requirements, and run main.py 
cd ../api/
source venv/bin/activate
pip install -r requirements.txt
python main.py

# install the app on the brain, this may be unneeded
set -uxeo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

rm -f ~/manifest.json
ln -s "$DIR/manifest.json" ~/manifest.json