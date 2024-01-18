#!/bin/bash -x

# create virtual environment for the backend in the api folder
cd api/
source venv/bin/activate

# build the frontend in the ts directory
cd ../ts/
npm run build

# install the app on the brain
set -uxeo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

rm -f ~/manifest.json
ln -s "$DIR/manifest.json" ~/manifest.json