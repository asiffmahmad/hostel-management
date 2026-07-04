-- V3: Create hostel_bank_transaction table for bank statement import feature

CREATE TABLE hostel_bank_transaction (
    id                  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    bank_name           VARCHAR(100)    NOT NULL COMMENT 'e.g. Axis Bank',
    account_number      VARCHAR(30)     NOT NULL COMMENT 'Bank account number from statement',
    transaction_date    DATE            NOT NULL COMMENT 'Date of transaction',
    value_date          DATE            NULL COMMENT 'Value date if different from transaction date',
    description         TEXT            NULL COMMENT 'PARTICULARS from statement (raw)',
    utr_number          VARCHAR(100)    NULL COMMENT 'Extracted UTR/reference number',
    amount              DECIMAL(15,2)   NOT NULL COMMENT 'Transaction amount (always positive)',
    transaction_type    VARCHAR(10)     NOT NULL COMMENT 'CREDIT or DEBIT',
    credit              DECIMAL(15,2)   NULL COMMENT 'Credit amount if CR transaction',
    debit               DECIMAL(15,2)   NULL COMMENT 'Debit amount if DR transaction',
    balance             DECIMAL(15,2)   NULL COMMENT 'Running balance after transaction',
    reference_number    VARCHAR(100)    NULL COMMENT 'Additional reference (CHQNO etc)',
    month               VARCHAR(20)     NOT NULL COMMENT 'e.g. JULY',
    year                VARCHAR(4)      NOT NULL COMMENT 'e.g. 2026',
    source_file         VARCHAR(255)    NULL COMMENT 'Original uploaded filename',
    imported_at         TIMESTAMP       NULL COMMENT 'When this record was imported',
    is_mapped           BOOLEAN         NOT NULL DEFAULT FALSE COMMENT 'Has this transaction been mapped to a student payment',
    mapped_payment_id   BIGINT          NULL COMMENT 'FK to hostel_payments.id if mapped',
    mapped_student_id   BIGINT          NULL COMMENT 'FK to hostel_students.id if mapped',
    mapped_at           TIMESTAMP       NULL COMMENT 'When the mapping was done',
    mapped_by           VARCHAR(100)    NULL COMMENT 'Username who mapped the payment',
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    is_deleted          BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by          VARCHAR(100)    NULL,
    updated_by          VARCHAR(100)    NULL
);

-- Indexes for efficient search
CREATE INDEX idx_bank_txn_utr          ON hostel_bank_transaction(utr_number);
CREATE INDEX idx_bank_txn_date         ON hostel_bank_transaction(transaction_date);
CREATE INDEX idx_bank_txn_month_year   ON hostel_bank_transaction(month, year);
CREATE INDEX idx_bank_txn_account      ON hostel_bank_transaction(account_number);
CREATE INDEX idx_bank_txn_type         ON hostel_bank_transaction(transaction_type);
CREATE INDEX idx_bank_txn_is_mapped    ON hostel_bank_transaction(is_mapped);
