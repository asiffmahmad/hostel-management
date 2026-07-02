package com.hostel.backend.repository;

import com.hostel.backend.entity.Payment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {

    @EntityGraph(attributePaths = {"student", "student.bed", "student.bed.room", "student.bed.room.hostel"})
    List<Payment> findAll();

    @EntityGraph(attributePaths = {"student"})
    List<Payment> findByStudentId(Long studentId);

    Optional<Payment> findByUtrNumber(String utrNumber);

    boolean existsByUtrNumber(String utrNumber);

    boolean existsByUtrNumberAndIdNot(String utrNumber, Long id);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.status = :status")
    Double sumAmountByStatus(@Param("status") String status);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.student.bed.room.hostel.id = :hostelId AND p.status = :status")
    Double sumAmountByHostelIdAndStatus(@Param("hostelId") Long hostelId, @Param("status") String status);

    @EntityGraph(attributePaths = {"student"})
    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId ORDER BY p.createdAt DESC")
    List<Payment> findByStudentIdOrderByCreatedAtDesc(@Param("studentId") Long studentId);

    @EntityGraph(attributePaths = {"student", "student.bed", "student.bed.room", "student.bed.room.hostel"})
    @Query("SELECT p FROM Payment p WHERE p.student.bed.room.hostel.id = :hostelId ORDER BY p.createdAt DESC")
    List<Payment> findByStudentBedRoomHostelIdOrderByCreatedAtDesc(@Param("hostelId") Long hostelId);

    @EntityGraph(attributePaths = {"student"})
    List<Payment> findTop5ByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"student"})
    List<Payment> findTop5ByStudentBedRoomHostelIdOrderByCreatedAtDesc(Long hostelId);

    @Query("SELECT p.month as month, p.year as year, SUM(p.amount) as total " +
           "FROM Payment p WHERE p.status = 'PAID' GROUP BY p.year, p.month")
    List<Object[]> getRevenueData();

    @Query("SELECT p.month as month, p.year as year, SUM(p.amount) as total " +
           "FROM Payment p WHERE p.status = 'PAID' AND p.student.bed.room.hostel.id = :hostelId " +
           "GROUP BY p.year, p.month")
    List<Object[]> getRevenueDataByHostelId(@Param("hostelId") Long hostelId);
}

