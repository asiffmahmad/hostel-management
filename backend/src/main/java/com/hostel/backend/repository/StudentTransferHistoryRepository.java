package com.hostel.backend.repository;

import com.hostel.backend.entity.StudentTransferHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentTransferHistoryRepository extends JpaRepository<StudentTransferHistory, Long> {
    List<StudentTransferHistory> findByStudentIdOrderByTransferDateDesc(Long studentId);
}
