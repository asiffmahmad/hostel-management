-- V2: Add UTR Number and bank-related fields to hostel_payments table
-- All columns are nullable so existing payments are unaffected (backward compatible)

ALTER TABLE hostel_payments
    ADD COLUMN utr_number VARCHAR(50) NULL COMMENT 'Unique Transaction Reference number from bank',
    ADD COLUMN bank_transaction_id BIGINT NULL COMMENT 'FK to hostel_bank_transaction table',
    ADD COLUMN payment_source VARCHAR(50) NULL DEFAULT 'MANUAL' COMMENT 'MANUAL or BANK_IMPORT',
    ADD COLUMN bank_name VARCHAR(100) NULL COMMENT 'Name of the bank e.g. Axis Bank',
    ADD COLUMN imported_date TIMESTAMP NULL COMMENT 'When the payment was imported from bank statement';

-- Unique index on utr_number (sparse: allows multiple NULLs in MySQL)
CREATE UNIQUE INDEX idx_payment_utr ON hostel_payments(utr_number);
