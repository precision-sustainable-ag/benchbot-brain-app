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
```

-----

### Setup cron job for regular backed up data removal

*Crontab Syntax*

```
MIN HOUR DOM MON DOW CMD
```

MIN for minutes

HOUR for hours

DOM for day of the month

MON for month

DOW for day of the week

CMD command, path to a script or a system command

<br>

* Open crontab configuration file by:
```
crontab -e
```

* If its the first time accessing the crontab, the system creates a new file. When prompted, select a preferred text editor for editing.

* Add a line containing a cron expression and path to the script.
```
0,30 11-18 * * * /home/benchbot/benchbot-brain-app/mini_computer_api/usb_transfer/delete_copied_files.sh
```

* List all cron jobs on the system without opening the crontab configuration file by:
```
crontab -l
```
