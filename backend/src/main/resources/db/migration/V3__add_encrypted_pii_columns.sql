-- Safe addition of encrypted columns. Existing data remains untouched.
ALTER TABLE hostel_students
    ADD COLUMN phone_encrypted VARCHAR(255),
    ADD COLUMN phone_hash VARCHAR(255),
    ADD COLUMN parent_phone_encrypted VARCHAR(255),
    ADD COLUMN parent_phone_hash VARCHAR(255),
    ADD COLUMN father_phone_encrypted VARCHAR(255),
    ADD COLUMN father_phone_hash VARCHAR(255),
    ADD COLUMN mother_phone_encrypted VARCHAR(255),
    ADD COLUMN mother_phone_hash VARCHAR(255),
    ADD COLUMN guardian_phone_encrypted VARCHAR(255),
    ADD COLUMN guardian_phone_hash VARCHAR(255),
    ADD COLUMN address_encrypted TEXT,
    ADD COLUMN email_encrypted VARCHAR(255),
    ADD COLUMN email_hash VARCHAR(255);

ALTER TABLE hostel_users
    ADD COLUMN phone_encrypted VARCHAR(255),
    ADD COLUMN phone_hash VARCHAR(255),
    ADD COLUMN email_encrypted VARCHAR(255),
    ADD COLUMN email_hash VARCHAR(255);

-- Indexes on hash columns for exact-match searching
CREATE INDEX idx_student_phone_hash ON hostel_students(phone_hash);
CREATE INDEX idx_student_parent_phone_hash ON hostel_students(parent_phone_hash);
CREATE INDEX idx_user_phone_hash ON hostel_users(phone_hash);
