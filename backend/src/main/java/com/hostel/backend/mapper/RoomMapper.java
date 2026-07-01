package com.hostel.backend.mapper;

import com.hostel.backend.dto.RoomDTO;
import com.hostel.backend.entity.Room;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {

    public RoomDTO toDTO(Room room) {
        if (room == null) return null;
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setHostelId(room.getHostel().getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomName(room.getRoomName());
        dto.setFloor(room.getFloor());
        dto.setCapacity(room.getCapacity());
        dto.setType(room.getType());
        dto.setDescription(room.getDescription());
        dto.setStatus(room.getStatus());
        dto.setBaseRent(room.getBaseRent());
        return dto;
    }

    public Room toEntity(RoomDTO dto) {
        if (dto == null) return null;
        Room room = new Room();
        room.setId(dto.getId());
        room.setRoomNumber(dto.getRoomNumber());
        room.setRoomName(dto.getRoomName());
        room.setFloor(dto.getFloor());
        room.setCapacity(dto.getCapacity());
        room.setType(dto.getType());
        room.setDescription(dto.getDescription());
        room.setStatus(dto.getStatus());
        room.setBaseRent(dto.getBaseRent());
        return room;
    }
}
