import json

# read features to be modified from the json file
with open("modified_features.json", "r") as file:
    cam_features = json.load(file)

# read from the camera features settings file
features_file = 'camera_features.txt'
with open(features_file, 'r', encoding='utf-8') as file: 
	data = file.readlines() 

# find and replace lines with updated values of features
values_changed = 0
for idx, line in enumerate(data):
    if '#' not in line:
        try:
            [key, value] = line.replace('\n', '').split('\t')
        except ValueError:
            continue
        if key in cam_features.keys():
            if value != cam_features[key]:
                data[idx] = f"{key}\t{cam_features[key]}\n"
                values_changed += 1

if values_changed>0:
    with open(features_file, 'w', encoding='utf-8') as file: 
        file.writelines(data)

