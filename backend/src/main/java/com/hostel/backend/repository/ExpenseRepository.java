package com.hostel.backend.repository;

import com.hostel.backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByIsDeletedFalse();

    @Query("SELECT MONTHNAME(e.expenseDate) as month, YEAR(e.expenseDate) as year, SUM(e.amount) as total " +
           "FROM Expense e WHERE e.isDeleted = false GROUP BY YEAR(e.expenseDate), MONTHNAME(e.expenseDate)")
    List<Object[]> getExpenseData();
}
