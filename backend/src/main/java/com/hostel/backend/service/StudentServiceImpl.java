package com.hostel.backend.service;

import com.hostel.backend.dto.StudentDTO;
import com.hostel.backend.entity.Bed;
import com.hostel.backend.entity.Student;
import com.hostel.backend.entity.StudentTransferHistory;
import com.hostel.backend.enums.BedStatus;
import com.hostel.backend.exception.ResourceNotFoundException;
import com.hostel.backend.mapper.StudentMapper;
import com.hostel.backend.repository.BedRepository;
import com.hostel.backend.repository.StudentRepository;
import com.hostel.backend.repository.StudentTransferHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final BedRepository bedRepository;
    private final StudentMapper studentMapper;
    private final StudentTransferHistoryRepository transferHistoryRepository;

    @Override
    public StudentDTO createStudent(StudentDTO studentDTO) {
        if (studentRepository.existsByStudentId(studentDTO.getStudentId())) {
            throw new IllegalArgumentException("Student ID already exists");
        }

        Student student = studentMapper.toEntity(studentDTO);

        if (studentDTO.getBedId() != null) {
            Bed bed = bedRepository.findById(studentDTO.getBedId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bed not found"));
            
            if (bed.getStatus() == BedStatus.OCCUPIED) {
                throw new IllegalArgumentException("Bed is already occupied");
            }
            
            student.setBed(bed);
            bed.setStatus(BedStatus.OCCUPIED);
        }

        Student savedStudent = studentRepository.save(student);
        
        if (savedStudent.getBed() != null) {
            savedStudent.getBed().setStudent(savedStudent);
            bedRepository.save(savedStudent.getBed());
            
            logTransfer(savedStudent, null, savedStudent.getBed(), "Initial Assignment");
        }

        return studentMapper.toDto(savedStudent);
    }

    @Override
    public StudentDTO updateStudent(Long id, StudentDTO studentDTO) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        existingStudent.setName(studentDTO.getName());
        existingStudent.setPhone(studentDTO.getPhone());
        existingStudent.setParentPhone(studentDTO.getParentPhone());
        existingStudent.setEmail(studentDTO.getEmail());
        existingStudent.setAddress(studentDTO.getAddress());
        existingStudent.setMonthlyRent(studentDTO.getMonthlyRent());
        existingStudent.setAdvanceDeposit(studentDTO.getAdvanceDeposit());
        existingStudent.setStatus(studentDTO.getStatus());

        if (studentDTO.getBedId() != null) {
            if (existingStudent.getBed() == null || !existingStudent.getBed().getId().equals(studentDTO.getBedId())) {
                transferStudent(id, studentDTO.getBedId(), "Updated from Student Profile");
            }
        } else if (existingStudent.getBed() != null) {
            vacateBed(id, "Updated from Student Profile");
        }

        Student updatedStudent = studentRepository.save(existingStudent);
        return studentMapper.toDto(updatedStudent);
    }

    @Override
    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return studentMapper.toDto(student);
    }

    @Override
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findByIsDeletedFalse().stream()
                .map(studentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        if (student.getBed() != null) {
            vacateBed(id, "Student Deleted");
        }

        student.setIsActive(false);
        student.setIsDeleted(true);
        studentRepository.save(student);
    }

    @Override
    public StudentDTO transferStudent(Long studentId, Long newBedId, String reason) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
                
        Bed oldBed = student.getBed();
        
        Bed newBed = bedRepository.findById(newBedId)
                .orElseThrow(() -> new ResourceNotFoundException("New bed not found"));
                
        if (newBed.getStatus() == BedStatus.OCCUPIED) {
            throw new IllegalArgumentException("New bed is already occupied");
        }
        
        if (oldBed != null) {
            oldBed.setStatus(BedStatus.VACANT);
            oldBed.setStudent(null);
            bedRepository.save(oldBed);
        }
        
        newBed.setStatus(BedStatus.OCCUPIED);
        newBed.setStudent(student);
        student.setBed(newBed);
        bedRepository.save(newBed);
        
        logTransfer(student, oldBed, newBed, reason);
        
        return studentMapper.toDto(studentRepository.save(student));
    }

    @Override
    public StudentDTO vacateBed(Long studentId, String reason) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
                
        Bed oldBed = student.getBed();
        if (oldBed != null) {
            oldBed.setStatus(BedStatus.VACANT);
            oldBed.setStudent(null);
            bedRepository.save(oldBed);
            
            student.setBed(null);
            logTransfer(student, oldBed, null, reason);
        }
        
        return studentMapper.toDto(studentRepository.save(student));
    }
    
    private void logTransfer(Student student, Bed fromBed, Bed toBed, String reason) {
        StudentTransferHistory history = new StudentTransferHistory();
        history.setStudent(student);
        history.setFromBed(fromBed);
        history.setToBed(toBed);
        history.setTransferDate(LocalDateTime.now());
        history.setReason(reason);
        transferHistoryRepository.save(history);
    }
}
