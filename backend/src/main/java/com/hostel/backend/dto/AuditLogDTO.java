package com.hostel.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuditLogDTO {
    private Long id;
    private String entityName;
    private Long entityId;
    private String action;
    private String oldValues;
    private String newValues;
    private String username;
    private String ipAddress;
    private LocalDateTime createdAt;
}
