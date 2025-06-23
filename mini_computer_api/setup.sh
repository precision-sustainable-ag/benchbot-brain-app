#!/bin/bash

ip link set dev enp2s0 mtu 9000
/home/benchbot/globusconnectpersonal-3.2.5/globusconnectpersonal -start &
python3 main.py