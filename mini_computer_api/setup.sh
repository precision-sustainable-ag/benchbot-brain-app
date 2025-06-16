#!/bin/bash

ip link set dev enp2s0 mtu 9000
python3 main.py