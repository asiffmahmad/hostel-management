package com.hostel.backend.repository;

import com.hostel.backend.entity.Hostel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HostelRepository extends JpaRepository<Hostel, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Hostel> {
    List<Hostel> findByIsDeletedFalse();
    long countByIsDeletedFalse();
}
