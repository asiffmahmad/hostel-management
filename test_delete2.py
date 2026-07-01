import requests

BASE_URL = 'http://localhost:8080/api'
login_res = requests.post(f"{BASE_URL}/auth/login", json={"username": "owner", "password": "Owner@123"})
token = login_res.json()['token']
headers = {"Authorization": f"Bearer {token}"}

# Create a dummy hostel
create_res = requests.post(f"{BASE_URL}/hostels", json={"name": "Delete Me Hostel", "status": "ACTIVE"}, headers=headers)
print("Create STATUS:", create_res.status_code)
if create_res.status_code == 201:
    h_id = create_res.json()['id']
    print("Deleting hostel ID:", h_id)
    del_res = requests.delete(f"{BASE_URL}/hostels/{h_id}", headers=headers)
    print("Delete STATUS:", del_res.status_code)
