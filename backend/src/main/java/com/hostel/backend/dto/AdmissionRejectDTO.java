package com.hostel.backend.dto;

import lombok.Data;

/**
 * DTO used when an admin rejects a pending admission request.
 */
@Data
public class AdmissionRejectDTO {
    /** Reason provided by the admin for rejecting the admission. */
    private String reason;
}
