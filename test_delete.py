import requests

BASE_URL = 'http://localhost:8080/api'
login_res = requests.post(f"{BASE_URL}/auth/login", json={"username": "owner", "password": "Owner@123"})
token = login_res.json()['token']
headers = {"Authorization": f"Bearer {token}"}

# Get hostels
hostels = requests.get(f"{BASE_URL}/hostels", headers=headers).json()
if len(hostels) > 0:
    first_hostel = hostels[0]
    res = requests.delete(f"{BASE_URL}/hostels/{first_hostel['id']}", headers=headers)
    print("STATUS:", res.status_code)
    print("BODY:", res.text)
