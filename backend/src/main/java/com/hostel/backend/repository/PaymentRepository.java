package com.hostel.backend.repository;

import com.hostel.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {

    List<Payment> findByStudentId(Long studentId);

    Optional<Payment> findByUtrNumber(String utrNumber);

    boolean existsByUtrNumber(String utrNumber);

    boolean existsByUtrNumberAndIdNot(String utrNumber, Long id);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.status = :status")
    Double sumAmountByStatus(@Param("status") String status);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.student.bed.room.hostel.id = :hostelId AND p.status = :status")
    Double sumAmountByHostelIdAndStatus(@Param("hostelId") Long hostelId, @Param("status") String status);

    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId ORDER BY p.createdAt DESC")
    List<Payment> findByStudentIdOrderByCreatedAtDesc(@Param("studentId") Long studentId);

    @Query("SELECT p FROM Payment p WHERE p.student.bed.room.hostel.id = :hostelId ORDER BY p.createdAt DESC")
    List<Payment> findByStudentBedRoomHostelIdOrderByCreatedAtDesc(@Param("hostelId") Long hostelId);
}

