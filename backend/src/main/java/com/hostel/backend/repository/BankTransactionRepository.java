package com.hostel.backend.repository;

import com.hostel.backend.entity.BankTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
@Repository
public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long>, JpaSpecificationExecutor<BankTransaction> {

    List<BankTransaction> findByMonthAndYearAndIsDeletedFalse(String month, String year);

    Optional<BankTransaction> findByUtrNumberAndIsDeletedFalse(String utrNumber);

    boolean existsByUtrNumberAndIsDeletedFalse(String utrNumber);

    List<BankTransaction> findByTransactionTypeAndMonthAndYearAndIsDeletedFalse(
            String transactionType, String month, String year);

    // Flexible search – any combination of criteria
    @Query("""
        SELECT t FROM BankTransaction t WHERE t.isDeleted = false
        AND (:utrNumber IS NULL OR UPPER(t.utrNumber) LIKE UPPER(CONCAT('%', :utrNumber, '%')))
        AND (:amount IS NULL OR t.amount = :amount)
        AND (:txnDate IS NULL OR t.transactionDate = :txnDate)
        AND (:reference IS NULL OR UPPER(t.referenceNumber) LIKE UPPER(CONCAT('%', :reference, '%')))
        ORDER BY t.transactionDate DESC
    """)
    List<BankTransaction> search(
            @Param("utrNumber") String utrNumber,
            @Param("amount") BigDecimal amount,
            @Param("txnDate") LocalDate txnDate,
            @Param("reference") String reference);

    @Modifying
    @Transactional
    @Query("UPDATE BankTransaction t SET t.isDeleted = true WHERE t.month = :month AND t.year = :year")
    void softDeleteByMonthAndYear(@Param("month") String month, @Param("year") String year);

    long countByMonthAndYearAndIsDeletedFalse(String month, String year);
}
