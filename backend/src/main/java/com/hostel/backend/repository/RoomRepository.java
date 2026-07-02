package com.hostel.backend.repository;

import com.hostel.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Room> {
    java.util.Optional<Room> findByHostelIdAndRoomNumber(Long hostelId, String roomNumber);
    List<Room> findByHostelId(Long hostelId);
}
