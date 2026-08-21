// Database Setup Script - Executes schema.sql against the Supabase database
// Usage: node setup-db.js
// Requires a valid DATABASE_URL in .env

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Reading schema.sql...');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    console.log('Executing schema against database...');
    await pool.query(schema);

    console.log('✅ Schema executed successfully!');

    // Verify the loans table exists
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'loans'
      ORDER BY ordinal_position
    `);

    if (result.rows.length > 0) {
      console.log('\n✅ "loans" table verified. Columns:');
      result.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
      });
    } else {
      console.log('\n❌ "loans" table was NOT found!');
    }
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
