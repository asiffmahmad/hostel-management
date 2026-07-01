const axios = require('axios');
const xlsx = require('xlsx');
const mysql = require('mysql2/promise');

const API_URL = 'http://localhost:8080/api';
const EXCEL_FILE = '../student_room_details_corrected_roomwise.xlsx';

async function cleanDatabase() {
  const connection = await mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: 4000,
    user: 'JExG9WZXgmGv2Sv.root',
    password: 'U7MUd37GPeYQyA9Z',
    database: 'test',
    ssl: { rejectUnauthorized: false } // Required for VERIFY_IDENTITY bypass or standard ssl mode
  });

  console.log('Truncating tables directly via SQL...');
  await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
  // await connection.query('TRUNCATE TABLE hostel_payments;');
  // await connection.query('TRUNCATE TABLE hostel_payment_histories;');
  try { await connection.query('TRUNCATE TABLE hostel_students;'); } catch(e){}
  try { await connection.query('TRUNCATE TABLE hostel_beds;'); } catch(e){}
  try { await connection.query('TRUNCATE TABLE hostel_rooms;'); } catch(e){}
  try { await connection.query('TRUNCATE TABLE hostel_hostels;'); } catch(e){}
  await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
  await connection.end();
  console.log('Database truncated successfully.');
}

async function importData() {
  console.log('Starting data import process...');

  try {
    await cleanDatabase();

    // 1. Register Admin User
    console.log('Registering admin user...');
    try {
      await axios.post(`${API_URL}/auth/signup`, {
        username: 'owner',
        name: 'Admin Owner',
        email: 'owner@hostel.com',
        phone: '9999999999',
        password: 'Owner@123',
        role: 'OWNER'
      });
      console.log('Admin user registered.');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message && err.response.data.message.includes('already taken')) {
        console.log('Admin user already exists.');
      } else {
        throw err;
      }
    }

    // 2. Login
    console.log('Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: 'owner',
      password: 'Owner@123'
    });
    const token = loginRes.data.token;
    console.log('Login successful. Token acquired.');

    const headers = { Authorization: `Bearer ${token}` };

    // 4. Parse Excel File
    console.log('Parsing Excel file...');
    const workbook = xlsx.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);
    console.log(`Found ${data.length} records in Excel.`);

    // 5. Create Hostel H3
    console.log('Creating Hostel H3...');
    const hostelRes = await axios.post(`${API_URL}/hostels`, {
      name: 'H3 Premium Hostel',
      status: 'ACTIVE',
      baseRent: 5600
    }, { headers });
    const hostelId = hostelRes.data.id;
    console.log(`Hostel created with ID: ${hostelId}`);

    // Extract unique rooms and capacities
    const roomMap = new Map();
    for (const row of data) {
      const roomNo = row['Room No'];
      if (!roomMap.has(roomNo)) {
        roomMap.set(roomNo, 0);
      }
      roomMap.set(roomNo, roomMap.get(roomNo) + 1);
    }

    // 6. Create Rooms and mapping
    console.log(`Creating ${roomMap.size} rooms...`);
    const roomNameToId = new Map();
    const roomToBedsMap = new Map(); // RoomId -> array of Bed objects

    for (const [roomNo, capacity] of roomMap.entries()) {
      const roomRes = await axios.post(`${API_URL}/rooms`, {
        hostelId: hostelId,
        roomNumber: roomNo,
        capacity: capacity,
        type: 'Non-AC'
      }, { headers });
      const roomId = roomRes.data.id;
      roomNameToId.set(roomNo, roomId);

      // Create Beds for this room
      const beds = [];
      for (let i = 1; i <= capacity; i++) {
         const bedRes = await axios.post(`${API_URL}/beds`, {
           roomId: roomId,
           bedNumber: `${roomNo}-B${String(i).padStart(2, '0')}`,
           status: 'VACANT'
         }, { headers });
         beds.push(bedRes.data);
      }
      roomToBedsMap.set(roomId, beds);
    }
    console.log('Rooms and beds created.');

    // 7. Insert Students
    console.log('Inserting students...');
    let studentCounter = 1;
    for (const row of data) {
      const roomNo = row['Room No'];
      const roomId = roomNameToId.get(roomNo);
      const beds = roomToBedsMap.get(roomId);
      
      // Find a vacant bed
      const availableBed = beds.find(b => b.status === 'VACANT');
      if (!availableBed) {
        console.error(`No vacant bed found in room ${roomNo} for student ${row['Student Name']}`);
        continue;
      }

      const studentIdStr = 'STU' + String(studentCounter).padStart(4, '0');
      
      const payload = {
        studentId: studentIdStr,
        name: row['Student Name'] || 'Unknown',
        phone: row['Student Phone'] ? String(row['Student Phone']) : '0000000000',
        fatherName: row['Father Name'] || '',
        fatherPhone: row['Father Phone'] ? String(row['Father Phone']) : '',
        motherName: row['Mother Name'] || '',
        motherPhone: row['Mother Phone'] ? String(row['Mother Phone']) : '',
        guardianRelation: row['Guardian/Other Relation'] || '',
        guardianName: row['Guardian/Other Name'] || '',
        guardianPhone: row['Guardian/Other Phone'] ? String(row['Guardian/Other Phone']) : '',
        notes: row['Notes'] || '',
        monthlyRent: 5600,
        advanceDeposit: 5600,
        status: row['Status'] === 'Occupied' ? 'ACTIVE' : 'INACTIVE',
        bedId: availableBed.id
      };

      try {
        await axios.post(`${API_URL}/students`, payload, { headers });
        availableBed.status = 'OCCUPIED'; // Mark as used locally to prevent assignment of same bed
        studentCounter++;
      } catch (err) {
        console.error(`Failed to create student ${payload.name}:`, err.response?.data || err.message);
      }
    }

    console.log(`Import completed! Successfully created ${studentCounter - 1} students.`);
    
  } catch (error) {
    console.error('Import failed:', error.response?.data || error.message);
  }
}

importData();
