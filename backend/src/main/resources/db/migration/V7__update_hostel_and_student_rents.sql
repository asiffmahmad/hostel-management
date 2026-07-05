-- Update base_rent for hostels
UPDATE hostel_hostels SET base_rent = 5600 WHERE name NOT LIKE '%H4%';
UPDATE hostel_hostels SET base_rent = 5300 WHERE name LIKE '%H4%';

-- Update monthly_rent for all students based on their hostel
UPDATE hostel_students s
JOIN hostel_hostels h ON s.hostel_id = h.id
SET s.monthly_rent = 5600
WHERE h.name NOT LIKE '%H4%';

UPDATE hostel_students s
JOIN hostel_hostels h ON s.hostel_id = h.id
SET s.monthly_rent = 5300
WHERE h.name LIKE '%H4%';
