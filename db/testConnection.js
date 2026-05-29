const pool = require('./connection'); // Import database connection
console.log('Testing database connection...');

const testDBConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Connected to database! Server time:', result.rows[0].now);
    process.exit(0);
  } catch (error) {
    console.error(' Failed to connect to database:', error.message);
    console.error('Full error details:', error);
    process.exit(1);
  }
};

testDBConnection();