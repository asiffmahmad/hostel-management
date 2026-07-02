const mysql = require('mysql2/promise');

async function testDb() {
  try {
    const connection = await mysql.createConnection({
      host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
      port: 4000,
      user: 'JExG9WZXgmGv2Sv.root',
      password: 'U7MUd37GPeYQyA9Z',
      database: 'test',
      ssl: {
        rejectUnauthorized: true
      }
    });
    
    console.log('Connected to DB');
    
    const [rows] = await connection.execute('SELECT * FROM hostel_users');
    console.log('Users found:', rows.length);
    if (rows.length > 0) {
      console.log('First user:', rows[0].username, rows[0].role);
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDb();
