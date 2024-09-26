
### Requests

SI = 5349
CC = 4343
CS = 4353
CT = 4354
CD = 4344
SR = 5352

init_sdk;
cam_conn;
cam_status;
cam_trigger;
cam_disconn;
release_sdk;


### Responses

resp = 0/1


### Commands

lcm-gen -x message.lcm
lcm-gen -p message.lcm
g++ -o main response.cpp -llcm