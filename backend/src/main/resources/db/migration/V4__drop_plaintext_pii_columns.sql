-- Phase 4: Retire old plaintext columns
ALTER TABLE hostel_students
    DROP COLUMN phone,
    DROP COLUMN parent_phone,
    DROP COLUMN father_phone,
    DROP COLUMN mother_phone,
    DROP COLUMN guardian_phone,
    DROP COLUMN email,
    DROP COLUMN address;

ALTER TABLE hostel_users
    DROP COLUMN phone,
    DROP COLUMN email;
