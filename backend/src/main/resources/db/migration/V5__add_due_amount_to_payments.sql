ALTER TABLE hostel_payments ADD COLUMN expected_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0;
ALTER TABLE hostel_payments ADD COLUMN due_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- Backfill existing data
UPDATE hostel_payments hp
SET expected_amount = COALESCE((SELECT monthly_rent FROM hostel_students hs WHERE hs.id = hp.student_id), 0.0);

-- If the payment is PAID, due is 0. Else, due is expected - amount
UPDATE hostel_payments hp
SET due_amount = CASE 
    WHEN hp.status = 'PAID' THEN 0.0 
    ELSE GREATEST(0.0, hp.expected_amount - hp.amount)
END;
