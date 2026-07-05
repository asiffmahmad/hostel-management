SELECT p.id, p.status, p.amount, s.name, b.bed_number, r.room_number, h.name 
FROM hostel_payments p 
JOIN hostel_students s ON p.student_id = s.id 
LEFT JOIN beds b ON s.bed_id = b.id 
LEFT JOIN rooms r ON b.room_id = r.id 
LEFT JOIN hostels h ON r.hostel_id = h.id;
