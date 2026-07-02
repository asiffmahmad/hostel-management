package com.hostel.backend.repository;

import com.hostel.backend.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByHostelId(Long hostelId);
    List<Complaint> findByRoomId(Long roomId);
}
