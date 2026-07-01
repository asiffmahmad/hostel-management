package com.hostel.backend.entity;

import com.hostel.backend.enums.BedStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hostel_beds", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"room_id", "bed_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Bed extends BaseEntity {

    @Column(name = "bed_number", nullable = false)
    private String bedNumber;

    @Column(name = "bed_name")
    private String bedName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BedStatus status = BedStatus.VACANT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;
}
