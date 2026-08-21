-- PostgreSQL Database Initialization Script for Aristotle Enterprises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Loans table for loan requests (used by Admin Dashboard & Ledger)
CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  borrower_name VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  purpose TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS loan_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_id VARCHAR(100) UNIQUE NOT NULL, -- Device generated offline UUID
    
    -- Contracting Parties
    lender_name VARCHAR(255) NOT NULL DEFAULT 'Aristotle Enterprises',
    lender_nida_passport VARCHAR(100),
    lender_phone VARCHAR(50),
    lender_address TEXT,
    
    borrower_name VARCHAR(255) NOT NULL,
    borrower_nida_passport VARCHAR(100) NOT NULL,
    borrower_phone VARCHAR(50) NOT NULL,
    borrower_address TEXT NOT NULL,
    borrower_business_address TEXT,
    borrower_passport_photo TEXT, -- Base64 String
    
    -- Loan Terms & Calculations
    principal_amount NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    interest_type VARCHAR(20) CHECK (interest_type IN ('Monthly', 'Yearly')),
    total_repayment_sum NUMERIC(15, 2) NOT NULL,
    maturity_date DATE NOT NULL,
    
    -- Collateral & Security
    collateral_description TEXT NOT NULL,
    collateral_value NUMERIC(15, 2) NOT NULL,
    
    -- Legal Terms & Enforcement
    default_penalty_terms TEXT DEFAULT 'Borrower bears 100% liability for all recovery, tracking, legal, and private investigator fees upon default.',
    jurisdiction_governing_law TEXT DEFAULT 'Laws of the United Republic of Tanzania',
    terms_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Witnesses & Attestation
    borrower_witness_name VARCHAR(255) NOT NULL,
    borrower_witness_relationship VARCHAR(100) NOT NULL,
    borrower_witness_phone VARCHAR(50) NOT NULL,
    
    lender_witness_name VARCHAR(255) NOT NULL,
    lender_witness_relationship VARCHAR(100) NOT NULL,
    lender_witness_phone VARCHAR(50) NOT NULL,
    
    -- Digital Verification Media
    borrower_signature TEXT NOT NULL, -- Base64 Vector
    lender_signature TEXT NOT NULL,   -- Base64 Vector
    official_stamp TEXT,              -- Base64 Notary/Local Gov Stamp Image
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loan_local_id ON loan_agreements(local_id);