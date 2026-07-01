package com.hostel.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hostel_rooms", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"hostel_id", "room_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Room extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_id", nullable = false)
    private Hostel hostel;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @Column(name = "room_name")
    private String roomName;

    @Column
    private String floor;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "room_type")
    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String status;

    @Column(name = "base_rent")
    private Double baseRent;
}
