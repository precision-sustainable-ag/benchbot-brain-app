#!/bin/bash

date=$(date +"%Y-%m-%d")
path_src=/home/benchbot/benchbot-brain-app/mini_computer_api/images/$date

path_dst=/home/benchbot/
if [[ ! -e $path_dst ]]; then
    mkdir -p "$path_dst"

status_file=files_copied.txt
if [ -f "$status_file" ]; then
    :
else
    touch "$status_file"
fi

for img_file in $path_src/*
do
    bname=$(basename "$img_file")
    dst_file=$path_dst/"$bname"

    if [ -f "$dst_file" ]; then
        :
    else 
        cp -u "$img_file" "$dst_file"
        echo "$bname" >> "$status_file"
    fi
done
