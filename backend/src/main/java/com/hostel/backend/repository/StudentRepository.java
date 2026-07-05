package com.hostel.backend.repository;

import com.hostel.backend.entity.Student;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Student> {
    
    @EntityGraph(attributePaths = {"bed", "bed.room", "hostel"})
    List<Student> findByBedId(Long bedId);
    
    boolean existsByStudentId(String studentId);
    
    List<Student> findByPhoneHashAndIsDeletedFalse(String phoneHash);
    
    @EntityGraph(attributePaths = {"bed", "bed.room", "hostel"})
    List<Student> findByIsDeletedFalse();
    
    @EntityGraph(attributePaths = {"bed", "bed.room", "hostel"})
    List<Student> findByHostelIdAndIsDeletedFalse(Long hostelId);
    
    long countByIsDeletedFalse();
    long countByHostelIdAndIsDeletedFalse(Long hostelId);
    
    long countByStatusAndBedIsNotNullAndIsDeletedFalse(String status);
    long countByHostelIdAndStatusAndBedIsNotNullAndIsDeletedFalse(Long hostelId, String status);
    
    @EntityGraph(attributePaths = {"bed", "bed.room", "hostel"})
    List<Student> findTop5ByIsDeletedFalseOrderByCreatedAtDesc();
    
    @EntityGraph(attributePaths = {"bed", "bed.room", "hostel"})
    List<Student> findTop5ByHostelIdAndIsDeletedFalseOrderByCreatedAtDesc(Long hostelId);
}
