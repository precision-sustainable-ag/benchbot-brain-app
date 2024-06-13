## Automatically transfer data to a usb drive on hot-plugging

* Plug in the drive and find its devpath using:
```
lsblk
```

* Then use the devpath (in this case /dev/sda1) to find all possible attributes in the udev rules key format:
```
# brief information
udevadm info /dev/sda1
# detailed information
udevadm info -a -n /dev/sda1
```

* Navigate to "/etc/udev/rules.d/". Create a new rules file and open it for editing by running:
```
sudo touch usb-drive.rules
sudo nano usb-drive.rules
```

* Add contents from given "usb-drive.rules" file (update key value pairs according to the specific attributes picked earlier), then save and close the file.

* Reload udev rules for changes to take effect by running:
```
sudo udevadm control --reload-rules
