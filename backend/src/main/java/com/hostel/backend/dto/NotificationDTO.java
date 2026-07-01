package com.hostel.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;

    @NotNull
    private Long userId;

    @NotBlank
    private String message;

    private Boolean isRead;
    private LocalDateTime createdAt;
}
