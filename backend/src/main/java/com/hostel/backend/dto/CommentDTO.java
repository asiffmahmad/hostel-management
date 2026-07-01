package com.hostel.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CommentDTO {
    private Long id;

    @NotBlank
    private String entityType;

    @NotNull
    private Long entityId;

    @NotBlank
    private String comment;

    @NotNull
    private Long userId;
}
