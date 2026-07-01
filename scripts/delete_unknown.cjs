const axios = require('axios');

const API_URL = 'http://localhost:8080/api';

async function deleteUnknownStudents() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: 'owner',
      password: 'Owner@123'
    });
    const token = loginRes.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Fetch all students
    const res = await axios.get(`${API_URL}/students`, { headers });
    const students = res.data;

    const unknownStudents = students.filter(s => s.name === 'Unknown');
    console.log(`Found ${unknownStudents.length} students named "Unknown". Deleting...`);

    for (const s of unknownStudents) {
      await axios.delete(`${API_URL}/students/${s.id}`, { headers });
      console.log(`Deleted student ID ${s.studentId}`);
    }

    console.log('Finished deleting unknown students.');
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

deleteUnknownStudents();
