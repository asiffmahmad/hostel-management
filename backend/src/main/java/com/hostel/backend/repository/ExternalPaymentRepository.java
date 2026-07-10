package com.hostel.backend.repository;

import com.hostel.backend.entity.ExternalPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalPaymentRepository extends JpaRepository<ExternalPayment, Long>, JpaSpecificationExecutor<ExternalPayment> {
    
    Optional<ExternalPayment> findByUtrNumberAndIsDeletedFalse(String utrNumber);
    
    List<ExternalPayment> findByValidationStatusAndIsDeletedFalse(String validationStatus);
    
    List<ExternalPayment> findByIsDeletedFalse();
    
    List<ExternalPayment> findByMonthIgnoreCaseAndYearAndIsDeletedFalse(String month, String year);
    
    List<ExternalPayment> findByMonthIgnoreCaseAndYearAndValidationStatusAndIsDeletedFalse(String month, String year, String validationStatus);
    
    boolean existsByUtrNumberAndIsDeletedFalse(String utrNumber);
}
