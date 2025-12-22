package com.example.fraud_detection.entity;

import com.example.fraud_detection.Type.TransactionStatus;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties("transactions")
    private User user;

    @Column(nullable = false)
    private Double amount;

    private String location;

    private String device;

    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    @OneToOne(mappedBy = "transaction", cascade = CascadeType.ALL)
    private FraudResult fraudResult;

    private String reviewedBy; // Lưu username hoặc email của Admin đã duyệt
    private LocalDateTime reviewedAt; // Thời điểm duyệt

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
        if (this.status == null) {
            this.status = TransactionStatus.PENDING;
        }
    }
}

