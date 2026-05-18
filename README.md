# benchmark-backend

A Node.js Express backend server connected to PostgreSQL for the benchmark application.

## Prerequisites

- **PostgreSQL** running locally on `localhost:5432`
- **Node.js** installed
- **npm** package manager

## Installation

1. Install dependencies:
```bash
npm install
```

## Configuration

The backend uses environment variables for database configuration. Configure your `.env` file with:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=benchmark
DB_USER=benchmark_user
DB_PASSWORD=yourpassword
NODE_ENV=development
PORT=3000
```

## Running the Server

Start the server:
```bash
node server.js
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/health`
  - Returns: `{ "message": "Server is running" }`

### Database Connection Test
- **GET** `/api/db-test`
  - Returns database connection status and current timestamp

### List Tables
- **GET** `/api/tables`
  - Returns all tables in the benchmark database

### Execute Custom Query
- **POST** `/api/query`
  - Request body: `{ "query": "SELECT * FROM your_table" }`
  - Returns query results

## Database Connection

The backend uses the `pg` package to connect to PostgreSQL. Connection pooling is configured with the following parameters from environment variables:
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name

## File Structure

- `server.js` - Main Express server and API routes
- `db.js` - PostgreSQL connection pool configuration
- `.env` - Environment variables (configure before running)
- `package.json` - Dependencies and scripts
