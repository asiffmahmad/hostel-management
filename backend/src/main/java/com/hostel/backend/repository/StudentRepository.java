package com.hostel.backend.repository;

import com.hostel.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Student> {
    List<Student> findByBedId(Long bedId);
    boolean existsByStudentId(String studentId);
    List<Student> findByIsDeletedFalse();
}
