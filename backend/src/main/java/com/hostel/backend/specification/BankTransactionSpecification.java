package com.hostel.backend.specification;

import com.hostel.backend.dto.BankTransactionGridFilterDTO;
import com.hostel.backend.entity.BankTransaction;
import com.hostel.backend.entity.Payment;
import com.hostel.backend.entity.Student;
import com.hostel.backend.entity.Hostel;
import com.hostel.backend.entity.Room;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class BankTransactionSpecification {
    public static Specification<BankTransaction> withFilter(BankTransactionGridFilterDTO filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getMonth() != null && !filter.getMonth().isBlank()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.upper(root.get("month")), filter.getMonth().toUpperCase()));
            }

            if (filter.getYear() != null && !filter.getYear().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("year"), filter.getYear()));
            }

            if (filter.getTransactionType() != null && !filter.getTransactionType().isBlank()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.upper(root.get("transactionType")), filter.getTransactionType().toUpperCase()));
            }

            if (filter.getUtrNumber() != null && !filter.getUtrNumber().isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.upper(root.get("utrNumber")), "%" + filter.getUtrNumber().toUpperCase() + "%"));
            }

            if (filter.getAmount() != null) {
                predicates.add(criteriaBuilder.equal(root.get("amount"), filter.getAmount()));
            }

            if (filter.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("transactionDate"), filter.getStartDate()));
            }

            if (filter.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("transactionDate"), filter.getEndDate()));
            }

            if (filter.getGlobalSearch() != null && !filter.getGlobalSearch().isBlank()) {
                String searchPattern = "%" + filter.getGlobalSearch().toUpperCase() + "%";
                
                Predicate pUtr = criteriaBuilder.like(criteriaBuilder.upper(root.get("utrNumber")), searchPattern);
                Predicate pRef = criteriaBuilder.like(criteriaBuilder.upper(root.get("referenceNumber")), searchPattern);
                Predicate pDesc = criteriaBuilder.like(criteriaBuilder.upper(root.get("description")), searchPattern);
                
                predicates.add(criteriaBuilder.or(pUtr, pRef, pDesc));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
