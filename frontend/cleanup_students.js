async function cleanup() {
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({username: 'owner', password: 'Owner@123'})
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  
  const res = await fetch('http://localhost:8080/api/students', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const students = await res.json();
  const unknownStudents = students.filter(s => s.name === 'Unknown' || s.name === 'Unknown (null)');
  console.log(`Found ${unknownStudents.length} unknown students to delete`);
  for (const s of unknownStudents) {
    try {
      await fetch(`http://localhost:8080/api/students/${s.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`Deleted student ${s.id}`);
    } catch(e) {
      console.error(`Failed to delete ${s.id}: ${e.message}`);
    }
  }
}
cleanup();
