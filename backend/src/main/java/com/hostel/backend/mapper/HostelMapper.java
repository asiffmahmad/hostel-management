package com.hostel.backend.mapper;

import com.hostel.backend.dto.HostelDTO;
import com.hostel.backend.entity.Hostel;
import org.springframework.stereotype.Component;

@Component
public class HostelMapper {

    public HostelDTO toDto(Hostel entity) {
        if (entity == null) {
            return null;
        }

        HostelDTO dto = new HostelDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setHostelCode(entity.getHostelCode());
        dto.setAddress(entity.getAddress());
        dto.setDescription(entity.getDescription());
        dto.setHostelType(entity.getHostelType());
        dto.setTotalFloors(entity.getTotalFloors());
        dto.setNotes(entity.getNotes());
        dto.setBaseRent(entity.getBaseRent());
        dto.setStatus(entity.getStatus());

        return dto;
    }

    public Hostel toEntity(HostelDTO dto) {
        if (dto == null) {
            return null;
        }

        Hostel entity = new Hostel();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setHostelCode(dto.getHostelCode());
        entity.setAddress(dto.getAddress());
        entity.setDescription(dto.getDescription());
        entity.setHostelType(dto.getHostelType());
        entity.setTotalFloors(dto.getTotalFloors());
        entity.setNotes(dto.getNotes());
        entity.setBaseRent(dto.getBaseRent());
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        
        return entity;
    }
}
