package com.hostel.backend.mapper;

import com.hostel.backend.dto.AuditLogDTO;
import com.hostel.backend.entity.AuditLog;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLogDTO toDto(AuditLog entity) {
        if (entity == null) {
            return null;
        }

        AuditLogDTO dto = new AuditLogDTO();
        dto.setId(entity.getId());
        dto.setEntityName(entity.getEntityName());
        dto.setEntityId(entity.getEntityId());
        dto.setAction(entity.getAction());
        dto.setOldValues(entity.getOldValues());
        dto.setNewValues(entity.getNewValues());
        dto.setUsername(entity.getUsername());
        dto.setIpAddress(entity.getIpAddress());
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }
}
