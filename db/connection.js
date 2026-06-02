require('dotenv').config();
const { Pool } = require('pg');

// Cloud Run connects to Cloud SQL via a Unix socket.
// Set CLOUD_SQL_CONNECTION_NAME=project:region:instance in Cloud Run env vars.
const poolConfig = process.env.CLOUD_SQL_CONNECTION_NAME
  ? {
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      host: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT) || 5432,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Connected to the database!');
});

module.exports = pool;
