#!/bin/bash

# mount point for backing up files on the usb drive
mount_point=/home/benchbot/backup
if [[ ! -e $mount_point ]]; then
    mkdir -p "$mount_point"
fi

# txt file to record which files were copied
status_file=/home/benchbot/files_copied.txt
if ! [ -f "$status_file" ]; then
    touch "$status_file"
fi

sleep 3
sudo mount /dev/sda $mount_point
sleep 1

log_dir=/home/benchbot/benchbot-brain-app/mini_computer_api/images
counter=0

# range 0 to 6 means past 7 days including current day
for n in {0..6}; 
do
    date=$(date -d "$n day ago" +"%Y-%m-%d")
    img_dir=$log_dir/NC_$date
    path_dst=$mount_point/NC_$date

    if [[ -e $img_dir ]]; then
        for img_file in $img_dir/*
        do
            if grep -Fxq "$img_file" $status_file
            then
                :
                # File already backed up
            else
                if [[ ! -e $path_dst ]]; then
                    mkdir -p "$path_dst"
                fi
                bname=$(basename "$img_file")
                dst_file=$path_dst/"$bname"
                if ! [ -f "$dst_file" ]; then
                    if cp -u "$img_file" "$dst_file"
                    then echo "$img_file" >> "$status_file"
                    ((counter++))
                    fi
                fi
            fi
        done
    fi
done

echo "File Transfer Done, $counter files backed up"
sleep 1
umount /dev/sda