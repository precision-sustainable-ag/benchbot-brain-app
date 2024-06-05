#!/bin/bash

mount_point=/home/benchbot/backup/
if [[ ! -e $mount_point ]]; then
    mkdir -p "$mount_point"
fi

status_file=/home/benchbot/files_copied.txt
if [ -f "$status_file" ]; then
    :
else
    touch "$status_file"
fi

sleep 5
sudo mount /dev/sda $mount_point
sleep 1

date=$(date +"%Y-%m-%d")
path_src=/home/benchbot/benchbot-brain-app/mini_computer_api/images/$date
path_dst=$mount_point/$date
if [[ ! -e $path_dst ]]; then
    mkdir -p "$path_dst"
fi

for img_file in $path_src/*
do
    bname=$(basename "$img_file")
    dst_file=$path_dst/"$bname"
    if [ -f "$dst_file" ]; then
        :
    else
        if cp -u "$img_file" "$dst_file"
        then echo "$img_file to $dst_file" >> "$status_file"
        fi
    fi
done

echo "File Transfer Done"
sleep 1
umount /dev/sda
