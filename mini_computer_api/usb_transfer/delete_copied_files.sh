#!/bin/bash

# txt file to record which files were copied
status_file=/home/benchbot/files_copied.txt
if ! [ -f "$status_file" ]; then
    # terminate script if file doesn't exist
    echo "Backup record file not present"
    exit 0
fi

log_dir=/home/benchbot/benchbot-brain-app/mini_computer_api/images

# range 7 to 30 means all past days from a week upto 31 days
for n in {7..30}; 
do
    date=$(date -d "$n day ago" +"%Y-%m-%d")
    img_dir=$log_dir/NC_$date
    if [[ -e $img_dir ]]; then
        # if the image directory for that date exists
        for img_file in $img_dir/*
        do
            if grep -Fxq "$img_file" $status_file
            then
                # File is already backed up, so delete it
                bname=$(basename "$img_file")
                if [ -f "$img_file" ] ; then
                    rm -f "$img_file"
                fi
            fi
        done
    fi
done

# delete all empty directories
find $log_dir -type d -empty -delete
