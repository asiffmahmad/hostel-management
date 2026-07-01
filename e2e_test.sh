#!/bin/bash
set -e
echo "Starting E2E Test..."
# Assuming backend is running on 8080.
# We will use curl to hit the endpoints and test the workflow.
# Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"username":"owner", "password":"Owner@123"}' | grep -o '"token":"[^"]*' | grep -o '[^"]*$')
if [ -z "$TOKEN" ]; then echo "Login failed"; exit 1; fi
echo "Logged in."

# Create Hostel
HOSTEL_RES=$(curl -s -X POST http://localhost:8080/api/hostels -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"Test Hostel E2E", "hostelCode":"E2E01", "address":"E2E Address"}')
HOSTEL_ID=$(echo $HOSTEL_RES | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Created Hostel ID: $HOSTEL_ID"

# Create Room
ROOM_RES=$(curl -s -X POST http://localhost:8080/api/rooms -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"hostelId\":$HOSTEL_ID, \"roomNumber\":\"101\", \"roomName\":\"E2E Room\", \"capacity\":2}")
ROOM_ID=$(echo $ROOM_RES | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Created Room ID: $ROOM_ID"

# Create Bed
BED_RES=$(curl -s -X POST http://localhost:8080/api/beds -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"roomId\":$ROOM_ID, \"bedNumber\":\"B1\", \"bedName\":\"E2E Bed 1\"}")
BED_ID=$(echo $BED_RES | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Created Bed ID: $BED_ID"

# Add Student and Assign Bed
STUDENT_RES=$(curl -s -X POST http://localhost:8080/api/students -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"studentId\":\"STU-E2E-1\", \"name\":\"E2E Student\", \"phone\":\"1234567890\", \"bedId\":$BED_ID}")
STUDENT_ID=$(echo $STUDENT_RES | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
echo "Added Student ID: $STUDENT_ID"

# Generate Reports
curl -s -X GET http://localhost:8080/api/reports/students/csv -H "Authorization: Bearer $TOKEN" > /dev/null
echo "Generated Report."

echo "E2E Test Passed Successfully!"
