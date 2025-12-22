package com.example.fraud_detection.entity;

import com.example.fraud_detection.Type.BlacklistType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "blacklist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Blacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private BlacklistType type;


    // 1. Dành cho User (Khóa ngoại)
    @ManyToOne(fetch = FetchType.EAGER) // EAGER để khi get Blacklist nó lấy luôn thông tin User
    @JoinColumn(name = "user_id")
    private User user;

    // 2. Dành cho IP hoặc Device (String thường)
    private String value;
    // --------------------

    private String reason;
    private boolean active = true;
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}