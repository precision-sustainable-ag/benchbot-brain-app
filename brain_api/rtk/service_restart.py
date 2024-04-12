import os
import time


os.system('sudo -u adminfarmng XDG_RUNTIME_DIR=/run/user/$(id -u adminfarmng) systemctl --user stop farmng-track_follower.service')
time.sleep(5)
os.system('sudo -u adminfarmng XDG_RUNTIME_DIR=/run/user/$(id -u adminfarmng) systemctl --user start farmng-track_follower.service')
print('Done')