// Database Setup Script - Executes schema.sql against the Supabase database
// Usage: node setup-db.js
// Requires a valid DATABASE_URL in .env
// Writes output to setup-db.log for reliable result capture

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const LOG_FILE = path.join(__dirname, 'setup-db.log');
const log = (msg) => {
  console.log(msg);
  fs.appendFileSync(LOG_FILE, msg + '\n');
};

async function setupDatabase() {
  // Clear previous log
  fs.writeFileSync(LOG_FILE, '');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    log(`Using host: ${process.env.DATABASE_URL.match(/@([^/]+)/)?.[1] || 'unknown'}`);
    log('Reading schema.sql...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    log('Executing schema against database...');
    await pool.query(schema);

    log('✅ Schema executed successfully!');

    // Verify the loans table exists
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'loans'
      ORDER BY ordinal_position
    `);

    if (result.rows.length > 0) {
      log('\n✅ "loans" table verified. Columns:');
      result.rows.forEach(col => {
        log(`  - ${col.column_name} (${col.data_type})${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
      });
      log('\nRESULT: SUCCESS');
    } else {
      log('\n❌ "loans" table was NOT found!');
      log('RESULT: FAILURE');
    }
  } catch (err) {
    log(`❌ Database setup failed: ${err.message}`);
    log(`RESULT: FAILURE`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setupDatabase();