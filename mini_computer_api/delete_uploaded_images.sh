#!/bin/bash
#source_ep=b3449c5c-e08e-11ee-8a1d-559499f32149
#source_path=/home/benchbot/benchbot-brain-app/mini_computer_api/images/*
#dest_ep=6d305f58-c963-4d7e-8624-1bcdba3ff8b2
#dest_path="/semifield-upload/Automated BenchBot v2 Upload/"
#globus transfer $source_ep:$source_path "$dest_ep:$dest_path"

# /home/benchbot/globusconnectpersonal-3.2.3/globusconnectpersonal -start

export PATH="~/.local/bin:$PATH"
echo 'export PATH="~/.local/bin:$PATH"' >> "$HOME/.bashrc"

data_age_limit=1

# iterate over every file in globus ls
for i in $(globus ls "ea8aff4a-274e-4c48-bc23-5b93da0cc941:/semifield-upload/"); do
    # extract date from folder
    echo "$i"

    if [ ! -d "/home/benchbot/benchbot-brain-app/mini_computer_api/images/${i::-1}" ]; then
      echo "/home/benchbot/benchbot-brain-app/mini_computer_api/images/${i::-1} does not exist."
      continue
    fi

    date=$(echo "$i" | cut -d'_' -f2)
    date=${date::-1}

    # create a date for $data_age_limit days ago
    limit_days_ago=$(date +%F -d "$data_age_limit days ago")
    echo "limit $limit_days_ago"
    echo "date $date"

    # if folder date is older than $data_age_limit, fetch all files in the directory
    if [[ $date -ge $limit_days_ago ]]
    then
        echo "Date is older than $data_age_limit days"
        # iterate over every file in the globus folder 
        echo "ea8aff4a-274e-4c48-bc23-5b93da0cc941:/semifield-upload/$i"
        folder_missing_file=false
        files_uploaded_to_globus=$(globus ls "ea8aff4a-274e-4c48-bc23-5b93da0cc941:/semifield-upload/$i")

        # for j in $(globus ls "ea8aff4a-274e-4c48-bc23-5b93da0cc941:/semifield-upload/$i"); do
        #   echo "$j"
        #   # if file doens't exist, echo not found
        #   if [ ! -f "/home/benchbot/benchbot-brain-app/mini_computer_api/images/$i/$j" ]; then
        #     echo "File $j not found!"
        #     folder_missing_file=true
        #   fi
        # done

        echo $files_uploaded_to_globus
        echo "$files_uploaded_to_globus" > files_uploaded_to_globus.txt

        for j in $(ls "/home/benchbot/benchbot-brain-app/mini_computer_api/images/$i"); do
          # echo "$j"
          # file_exists=$(echo $files_uploaded_to_globus | grep "$j" ; echo $?)
          # file_exists=$(grep -q "$j" $files_uploaded_to_globus)
          # echo "$file_exists"
          # if file doens't exist, echo not found
          # echo $(grep -rn "$j" "files_uploaded_to_globus.txt")
          # if [[ $files_uploaded_to_globus == *"$j"* ]]; then
          #   # echo "File $j not found!"
          #   folder_missing_file=true
          # fi
          echo $j
          # echo $folder_missing_file
          current_image_missing=false
          grep -qrn "$j" "files_uploaded_to_globus.txt" && current_image_missing=false || current_image_missing=true
          echo $current_image_missing
          if [ "$current_image_missing" = true ] ; then
            echo "folder missing files!"
            folder_missing_file=true
          fi
        done

        echo $folder_missing_file
        if [ "$folder_missing_file" = true ] ; then
          # $(rm -r ls "/home/benchbot/benchbot-brain-app/mini_computer_api/images/$i")
          echo "Some files are not uploaded!"
        else
          echo $(rm -r "/home/benchbot/benchbot-brain-app/mini_computer_api/images/$i")
        fi
    fi
    echo "$id"
    # echo $(rm -r "/home/benchbot/benchbot-brain-app/mini_computer_api/images/$i")
done
