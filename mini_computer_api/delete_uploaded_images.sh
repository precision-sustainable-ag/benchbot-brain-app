#!/bin/bash
# source_path=/home/benchbot/benchbot-brain-app/mini_computer_api/images/*

/home/benchbot/globusconnectpersonal-3.2.3/globusconnectpersonal -start

export PATH="~/.local/bin:$PATH"
echo 'export PATH="~/.local/bin:$PATH"' >> "$HOME/.bashrc"

data_age_limit=1

# iterate over every folder in globus ls
for i in $(globus ls "ea8aff4a-274e-4c48-bc23-5b93da0cc941:/semifield-upload/"); do
    # echo current folder
    echo "$i"

    # if folder does not exist locally, continue
    if [ ! -d "/home/benchbot/benchbot-brain-app/mini_computer_api/images/${i::-1}" ]; then
      echo "/home/benchbot/benchbot-brain-app/mini_computer_api/images/${i::-1} does not exist."
      continue
    fi

    # extract date from folder
    date=$(echo "$i" | cut -d'_' -f2)
    date=${date::-1}

    # create a date for $data_age_limit days ago
    limit_days_ago=$(date +%F -d "$data_age_limit days ago")
    
    # echo out date and limit_days_ago
    echo "limit $limit_days_ago"
    echo "date $date"

    # if folder date is older than $data_age_limit, fetch all files in the directory
    if [[ $date -ge $limit_days_ago ]]
    then
        echo "Date is older than $data_age_limit days"

        # assume folder has all images until proved otherwise
        folder_missing_file=false
        files_uploaded_to_globus=$(globus ls "ea8aff4a-274e-4c48-bc23-5b93da0cc941:/semifield-upload/$i")

        echo $files_uploaded_to_globus

        # pipe globus ls of all files into files_uploaded_to_globus.txt
        echo "$files_uploaded_to_globus" > files_uploaded_to_globus.txt

        for j in $(ls "/home/benchbot/benchbot-brain-app/mini_computer_api/images/$i"); do
          # echo out current file
          echo $j

          # by default, assume image exists
          current_image_missing=false

          # grep files_uploaded_to_globus.txt for the current file, if it exists set current_image_missing to false, else true
          grep -qrn "$j" "files_uploaded_to_globus.txt" && current_image_missing=false || current_image_missing=true

          # echo current_image_missing
          echo $current_image_missing

          if [ "$current_image_missing" = true ] ; then
            # if any file is missing, set folder_missing_file to true
            echo "folder missing files!"
            folder_missing_file=true
          fi
        done

        # if the folder has files that aren't uploaded to globus, it is not safe to delete, do nothing
        if [ "$folder_missing_file" = true ] ; then
          echo "Some files are not uploaded!"
        # else, all files are uploaded, delete folder
        else
          echo $(rm -r "/home/benchbot/benchbot-brain-app/mini_computer_api/images/$i")
        fi
    fi
done
