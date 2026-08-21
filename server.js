const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Enable CORS for all cross-origin requests
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Root Health Check
app.get('/', (req, res) => {
  res.send('Aristotle Sync Engine Running');
});

// GET all loans (Used by Admin Dashboard & Ledger)
app.get('/api/loans', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM loans ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch error' });
  }
});

// POST new loan request
app.post('/api/loans', async (req, res) => {
  const { borrower_name, amount, purpose } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO loans (borrower_name, amount, purpose, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [borrower_name, amount, purpose, 'PENDING']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create loan request' });
  }
});

// PUT update loan status (Approve/Reject)
app.put('/api/loans/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE loans SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update loan status' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));