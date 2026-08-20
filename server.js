require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const { Expo } = require('expo-server-sdk');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const expo = new Expo();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

let developerPushToken = process.env.DEVELOPER_PUSH_TOKEN || '';

app.post('/api/register-push-token', (req, res) => {
  const { token } = req.body;
  if (token && Expo.isExpoPushToken(token)) {
    developerPushToken = token;
    console.log('Registered Developer Push Token:', developerPushToken);
    return res.status(200).json({ success: true, message: 'Push token saved.' });
  }
  return res.status(400).json({ success: false, error: 'Invalid push token.' });
});

app.post('/api/sync-loan', async (req, res) => {
  const d = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO loan_agreements (
        local_id, lender_name, lender_nida_passport, lender_phone, lender_address,
        borrower_name, borrower_nida_passport, borrower_phone, borrower_address, borrower_business_address,
        borrower_passport_photo, principal_amount, interest_rate, interest_type, total_repayment_sum,
        maturity_date, collateral_description, collateral_value, borrower_witness_name,
        borrower_witness_relationship, borrower_witness_phone, lender_witness_name,
        lender_witness_relationship, lender_witness_phone, borrower_signature, lender_signature, official_stamp, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27, 'PENDING')
      ON CONFLICT (local_id) DO UPDATE SET updated_at = NOW()
      RETURNING id;
    `, [
      d.local_id, d.lender_name, d.lender_nida_passport, d.lender_phone, d.lender_address,
      d.borrower_name, d.borrower_nida_passport, d.borrower_phone, d.borrower_address, d.borrower_business_address,
      d.borrower_passport_photo, d.principal_amount, d.interest_rate, d.interest_type, d.total_repayment_sum,
      d.maturity_date, d.collateral_description, d.collateral_value, d.borrower_witness_name,
      d.borrower_witness_relationship, d.borrower_witness_phone, d.lender_witness_name,
      d.lender_witness_relationship, d.lender_witness_phone, d.borrower_signature, d.lender_signature, d.official_stamp
    ]);

    const loanId = result.rows[0].id;

    if (developerPushToken && Expo.isExpoPushToken(developerPushToken)) {
      await expo.sendPushNotificationsAsync([{
        to: developerPushToken,
        sound: 'default',
        title: '🚨 NEW LOAN REQUEST',
        body: `${d.borrower_name} requested TZS ${Number(d.principal_amount).toLocaleString()}`,
        data: { loanId: loanId, borrower: d.borrower_name }
      }]);
    }

    await transporter.sendMail({
      from: `"Aristotle Enterprises" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🚨 LOAN APPLICATION: ${d.borrower_name} (TZS ${d.principal_amount})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Loan Application Submitted</h2>
          <p><b>Borrower:</b> ${d.borrower_name} (${d.borrower_phone})</p>
          <p><b>Amount Requested:</b> TZS ${Number(d.principal_amount).toLocaleString()}</p>
          <p><b>Maturity Date:</b> ${d.maturity_date}</p>
          <p><b>Collateral:</b> ${d.collateral_description}</p>
          <hr/>
          <p>Status: <b>PENDING REVIEW</b></p>
        </div>
      `
    });

    res.status(200).json({ success: true, message: 'Loan submitted and notifications sent.', loanId });
  } catch (err) {
    console.error('Sync Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/pending-loans', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM loan_agreements WHERE status = 'PENDING' ORDER BY created_at DESC");
    res.status(200).json({ success: true, loans: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/loan/:id/decision', async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body;

  try {
    await pool.query('UPDATE loan_agreements SET status = $1, updated_at = NOW() WHERE id = $2', [decision, id]);
    res.status(200).json({ success: true, message: `Loan status set to ${decision}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Aristotle Sync Engine running on port ${PORT}`));