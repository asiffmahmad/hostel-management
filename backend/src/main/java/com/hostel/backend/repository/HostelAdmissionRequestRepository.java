package com.hostel.backend.repository;

import com.hostel.backend.entity.HostelAdmissionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HostelAdmissionRequestRepository extends JpaRepository<HostelAdmissionRequest, Long> {
    Optional<HostelAdmissionRequest> findByPhoneAndStatus(String phone, com.hostel.backend.enums.AdmissionStatus status);
}
