package com.hostel.backend.mapper;

import com.hostel.backend.dto.BedDTO;
import com.hostel.backend.entity.Bed;
import com.hostel.backend.entity.Room;
import com.hostel.backend.entity.Student;
import org.springframework.stereotype.Component;

@Component
public class BedMapper {

    public BedDTO toDto(Bed entity) {
        if (entity == null) {
            return null;
        }

        BedDTO dto = new BedDTO();
        dto.setId(entity.getId());
        dto.setBedNumber(entity.getBedNumber());
        dto.setBedName(entity.getBedName());
        dto.setStatus(entity.getStatus());
        
        if (entity.getStudent() != null) {
            dto.setStudentId(entity.getStudent().getId());
            dto.setStudentName(entity.getStudent().getName());
        }
        
        if (entity.getRoom() != null) {
            dto.setRoomId(entity.getRoom().getId());
        }

        return dto;
    }

    public Bed toEntity(BedDTO dto) {
        if (dto == null) {
            return null;
        }

        Bed entity = new Bed();
        entity.setId(dto.getId());
        entity.setBedNumber(dto.getBedNumber());
        entity.setBedName(dto.getBedName());
        entity.setStatus(dto.getStatus());
        
        if (dto.getStudentId() != null) {
            Student student = new Student();
            student.setId(dto.getStudentId());
            entity.setStudent(student);
        }

        if (dto.getRoomId() != null) {
            Room room = new Room();
            room.setId(dto.getRoomId());
            entity.setRoom(room);
        }

        return entity;
    }
}
