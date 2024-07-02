#!/usr/bin/env bash

echo $1
if [ $1 == "NC" ]; then
    # setup new DNS server
    echo "nameserver 152.1.14.14" | tee -a /etc/resolv.conf
    echo "nameserver 152.1.14.53" | tee -a /etc/resolv.conf
    # setup new static ip configuration
    ip addr add 192.168.8.10/24 dev eth0
    ip route add default via 192.168.8.1

else
    # setup internet sharing from brain to mini computer
    sudo sysctl -w net.ipv4.ip_forward=1
    sudo iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE
fi
