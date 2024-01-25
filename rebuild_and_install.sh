#!/bin/bash -x

# install the app on the brain
set -uxeo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

rm -f ~/manifest.json
ln -s "$DIR/manifest.json" ~/manifest.json

# build the frontend in the ts directory
cd front_end/
npm run build

# activate venv, and run main.py 
cd ../
source venv/bin/activate
cd ./brain_api
python main.py
