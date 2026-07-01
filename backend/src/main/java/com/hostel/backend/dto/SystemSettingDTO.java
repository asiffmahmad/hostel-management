package com.hostel.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SystemSettingDTO {
    private Long id;
    
    @NotBlank
    private String settingKey;
    
    @NotBlank
    private String settingValue;
    
    private String description;
}
