import requests
# url = 'http://0.0.0.0:8042/clearcore?x=10&z=0'
url = 'http://0.0.0.0:8042/move_xz_axis?x=10&z=0'
res = requests.get(url)
print(res)

