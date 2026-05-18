const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Test database connection
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      message: 'Database connection successful',
      timestamp: result.rows[0],
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Get all tables in the benchmark database
app.get('/api/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    res.status(200).json({
      message: 'Tables retrieved successfully',
      tables: result.rows.map(row => row.table_name),
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      message: 'Failed to retrieve tables',
      error: error.message,
    });
  }
});

// Query endpoint template (for custom queries)
app.post('/api/query', async (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const result = await pool.query(query);
    res.status(200).json({
      message: 'Query executed successfully',
      rows: result.rows,
      rowCount: result.rowCount,
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({
      message: 'Query execution failed',
      error: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Connected to database: ${process.env.DB_NAME}`);
});
