import pandas as pd
import requests

df = pd.read_excel('student_room_details_corrected_roomwise.xlsx')
BASE_URL = 'http://localhost:8080/api'

# 1. Login
login_res = requests.post(f"{BASE_URL}/auth/login", json={"username": "owner", "password": "Owner@123"})
if login_res.status_code not in [200, 201]:
    print("Failed to login", login_res.text)
    exit(1)

token = login_res.json()['token']
headers = {"Authorization": f"Bearer {token}"}

# 2. Get or Create Hostel
hostel_id = None
all_hostels = requests.get(f"{BASE_URL}/hostels", headers=headers).json()
for h in all_hostels:
    if h.get('name') == 'H3 Hostel':
        hostel_id = h['id']
        break

if not hostel_id:
    hostel_data = {
        "name": "H3 Hostel",
        "hostelCode": "H3",
        "address": "H3 Campus",
        "totalFloors": 3,
        "hostelType": "GIRLS",
        "status": "ACTIVE"
    }
    hostel_res = requests.post(f"{BASE_URL}/hostels", json=hostel_data, headers=headers)
    if hostel_res.status_code not in [200, 201]:
        print("Failed to create hostel", hostel_res.text)
        exit(1)
    hostel_id = hostel_res.json()['id']
    print(f"Created Hostel H3 with ID {hostel_id}")

rooms = {}
all_rooms = requests.get(f"{BASE_URL}/rooms/hostel/{hostel_id}", headers=headers).json()
if isinstance(all_rooms, list):
    for r in all_rooms:
        rooms[r['roomNumber']] = r['id']

student_count = 1

for index, row in df.iterrows():
    room_no = str(row['Room No']).strip()
    if room_no == 'nan' or not room_no:
        continue
        
    bed_no = str(row['Bed / No']).strip()
    status = str(row['Status']).strip()
    student_name = str(row['Student Name']).strip()
    phone = str(row['Student Phone']).strip()
    parent_phone = str(row['Father Phone']).strip()
    
    # Clean nan strings
    if phone == 'nan': phone = ''
    if parent_phone == 'nan': parent_phone = ''
    if student_name == 'nan': student_name = ''
    
    if phone.endswith('.0'): phone = phone[:-2]
    if parent_phone.endswith('.0'): parent_phone = parent_phone[:-2]

    # 3. Create Room if not exists
    if room_no not in rooms:
        room_data = {
            "hostelId": hostel_id,
            "roomNumber": room_no,
            "roomName": f"Room {room_no}",
            "capacity": 4,
            "floor": "1",
            "status": "ACTIVE",
            "roomType": "AC"
        }
        r_res = requests.post(f"{BASE_URL}/rooms", json=room_data, headers=headers)
        if r_res.status_code not in [200, 201]:
            print("Failed to create room", r_res.text)
            continue
        rooms[room_no] = r_res.json()['id']
    
    room_id = rooms[room_no]
    
    # Check if bed exists
    all_beds = requests.get(f"{BASE_URL}/beds/room/{room_id}", headers=headers).json()
    bed_id = None
    if isinstance(all_beds, list):
        for b in all_beds:
            if b['bedNumber'] == f"{room_no}-{bed_no}":
                bed_id = b['id']
                break

    # 4. Create Bed
    if not bed_id:
        bed_data = {
            "roomId": room_id,
            "bedNumber": f"{room_no}-{bed_no}",
            "bedName": f"Bed {bed_no}",
            "status": "VACANT"
        }
        b_res = requests.post(f"{BASE_URL}/beds", json=bed_data, headers=headers)
        if b_res.status_code not in [200, 201]:
            print("Failed to create bed", b_res.text)
            continue
        bed_id = b_res.json()['id']
    
    # 5. Add Student if occupied
    if status.lower() == 'occupied' and student_name:
        s_data = {
            "studentId": f"STU-H3-{student_count:04d}",
            "name": student_name,
            "phone": phone if phone else "0000000000",
            "parentPhone": parent_phone if parent_phone else "0000000000",
            "email": f"student{student_count}@test.com",
            "bedId": bed_id,
            "monthlyRent": 5000.0,
            "advanceDeposit": 10000.0,
            "joiningDate": "2024-01-01"
        }
        s_res = requests.post(f"{BASE_URL}/students", json=s_data, headers=headers)
        if s_res.status_code not in [200, 201]:
            print("Failed to add student", s_res.text)
        else:
            print(f"Added student {student_name}")
            student_count += 1
            
print("Successfully ingested H3 Hostel Data")
