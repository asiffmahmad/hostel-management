package com.hostel.backend.entity;

import com.hostel.backend.enums.HostelStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hostel_hostels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Hostel extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "hostel_code", unique = true)
    private String hostelCode;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "hostel_type")
    private String hostelType;

    @Column(name = "total_floors")
    private Integer totalFloors;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "base_rent")
    private Double baseRent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private HostelStatus status = HostelStatus.ACTIVE;
}
