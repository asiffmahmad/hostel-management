package com.hostel.backend.service;

import com.hostel.backend.dto.StudentDTO;
import com.hostel.backend.entity.Bed;
import com.hostel.backend.entity.Student;
import com.hostel.backend.enums.BedStatus;
import com.hostel.backend.mapper.StudentMapper;
import com.hostel.backend.repository.BedRepository;
import com.hostel.backend.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class StudentServiceImplTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private BedRepository bedRepository;

    @Mock
    private StudentMapper studentMapper;

    @Mock
    private com.hostel.backend.repository.StudentTransferHistoryRepository transferHistoryRepository;

    @InjectMocks
    private StudentServiceImpl studentService;

    private StudentDTO studentDTO;
    private Student student;
    private Bed bed;

    @BeforeEach
    void setUp() {
        studentDTO = new StudentDTO();
        studentDTO.setStudentId("ST1001");
        studentDTO.setName("John Doe");
        studentDTO.setBedId(1L);

        student = new Student();
        student.setId(1L);
        student.setStudentId("ST1001");
        student.setName("John Doe");

        bed = new Bed();
        bed.setId(1L);
        bed.setBedNumber("B1");
        bed.setStatus(BedStatus.VACANT);
    }

    @Test
    void testCreateStudentWithBedAssignment_Success() {
        when(studentRepository.existsByStudentId(studentDTO.getStudentId())).thenReturn(false);
        when(studentMapper.toEntity(studentDTO)).thenReturn(student);
        when(bedRepository.findById(studentDTO.getBedId())).thenReturn(Optional.of(bed));
        when(studentRepository.save(any(Student.class))).thenReturn(student);
        when(studentMapper.toDto(student)).thenReturn(studentDTO);

        StudentDTO result = studentService.createStudent(studentDTO);

        assertNotNull(result);
        assertEquals("ST1001", result.getStudentId());
        assertEquals(BedStatus.OCCUPIED, bed.getStatus());
        
        verify(studentRepository, times(1)).save(any(Student.class));
        verify(bedRepository, times(1)).save(bed);
    }

    @Test
    void testCreateStudent_BedAlreadyOccupied_ThrowsException() {
        bed.setStatus(BedStatus.OCCUPIED);
        
        when(studentRepository.existsByStudentId(studentDTO.getStudentId())).thenReturn(false);
        when(studentMapper.toEntity(studentDTO)).thenReturn(student);
        when(bedRepository.findById(studentDTO.getBedId())).thenReturn(Optional.of(bed));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            studentService.createStudent(studentDTO);
        });

        assertEquals("Bed is already occupied", exception.getMessage());
        verify(studentRepository, never()).save(any(Student.class));
    }
}
