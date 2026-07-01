package com.hostel.backend.service;

import com.hostel.backend.dto.StudentDTO;
import java.util.List;

public interface StudentService {
    StudentDTO createStudent(StudentDTO studentDTO);
    StudentDTO updateStudent(Long id, StudentDTO studentDTO);
    StudentDTO getStudentById(Long id);
    List<StudentDTO> getAllStudents();
    void deleteStudent(Long id);
    
    StudentDTO transferStudent(Long studentId, Long newBedId, String reason);
    StudentDTO vacateBed(Long studentId, String reason);
}
