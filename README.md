# Benchbot Brain App

This repository contains the front end and the back end to create the benchbot application that is deployable to the Amiga brain.

It used a template provided by farm-ng. For the most up-to-date documentation, please refer to:

[**Developing Custom Applications**](https://amiga.farm-ng.com/docs/brain/brain-apps)

---

## Building and running the app:

1. Copy this repository

2. Install nvm
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Verify by closing current terminal and opening a new one
nvm --version

nvm install --lts
```

3. For first time build, run
```
./initial_build.sh
```

4. To register the app in the launcher, run
```
./install.sh
```

<br>

To build the frontend after changes:
```
cd front_end
npm install
npm run build # build the frontend
```
