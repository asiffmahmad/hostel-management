package com.hostel.backend.entity;

import com.hostel.backend.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "hostel_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;
    
    @Transient
    private String phone;

    @Column(name = "phone_encrypted")
    private String phoneEncrypted;

    @Column(name = "phone_hash")
    private String phoneHash;
    
    @Transient
    private String email;

    @Column(name = "email_encrypted")
    private String emailEncrypted;

    @Column(name = "email_hash")
    private String emailHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @PrePersist
    @PreUpdate
    public void secureData() {
        if (this.phone != null) {
            this.phoneEncrypted = com.hostel.backend.security.EncryptionContext.encrypt(this.phone);
            this.phoneHash = com.hostel.backend.security.EncryptionContext.hash(this.phone);
        }
        if (this.email != null) {
            this.emailEncrypted = com.hostel.backend.security.EncryptionContext.encrypt(this.email);
            this.emailHash = com.hostel.backend.security.EncryptionContext.hash(this.email);
        }
    }

    @PostLoad
    public void loadSecureData() {
        if (this.phoneEncrypted != null) {
            this.phone = com.hostel.backend.security.EncryptionContext.decrypt(this.phoneEncrypted);
        }
        if (this.emailEncrypted != null) {
            this.email = com.hostel.backend.security.EncryptionContext.decrypt(this.emailEncrypted);
        }
    }
}
