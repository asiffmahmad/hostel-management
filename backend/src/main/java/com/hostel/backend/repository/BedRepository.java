package com.hostel.backend.repository;

import com.hostel.backend.entity.Bed;
import com.hostel.backend.enums.BedStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Bed> {
    List<Bed> findByRoomId(Long roomId);
    List<Bed> findByRoomHostelId(Long hostelId);

    @Query("SELECT COUNT(b) FROM Bed b WHERE b.room.hostel.id = :hostelId")
    int countBedsByHostelId(@Param("hostelId") Long hostelId);

    @Query("SELECT COUNT(b) FROM Bed b WHERE b.room.hostel.id = :hostelId AND b.status = :status")
    int countBedsByHostelIdAndStatus(@Param("hostelId") Long hostelId, @Param("status") BedStatus status);
}
