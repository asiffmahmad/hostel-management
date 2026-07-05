-- Add hostel_id column to hostel_students table
ALTER TABLE hostel_students ADD COLUMN hostel_id BIGINT;

-- Add foreign key constraint mapping hostel_id to hostel_hostels(id)
ALTER TABLE hostel_students ADD CONSTRAINT fk_student_hostel FOREIGN KEY (hostel_id) REFERENCES hostel_hostels(id);

-- Backfill hostel_id for existing students based on their current bed assignment
UPDATE hostel_students hs
JOIN hostel_beds b ON hs.bed_id = b.id
JOIN hostel_rooms r ON b.room_id = r.id
SET hs.hostel_id = r.hostel_id
WHERE hs.bed_id IS NOT NULL;
