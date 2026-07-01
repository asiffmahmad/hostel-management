import requests

BASE_URL = 'http://localhost:8080/api'

# 1. Login
login_res = requests.post(f"{BASE_URL}/auth/login", json={"username": "owner", "password": "Owner@123"})
token = login_res.json()['token']
headers = {"Authorization": f"Bearer {token}"}

# 2. Get all hostels
hostels = requests.get(f"{BASE_URL}/hostels", headers=headers).json()
for h in hostels:
    rooms = requests.get(f"{BASE_URL}/rooms/hostel/{h['id']}", headers=headers).json()
    for r in rooms:
        if r['type'] != 'Non-AC':
            r['type'] = 'Non-AC'
            res = requests.put(f"{BASE_URL}/rooms/{r['id']}", json=r, headers=headers)
            if res.status_code == 200:
                print(f"Updated room {r['roomNumber']}")
            else:
                print(f"Failed to update room {r['roomNumber']}")
