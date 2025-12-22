package com.example.fraud_detection.entity;



import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "transaction_id", nullable = false, unique = true)
    @JsonBackReference
    private Transaction transaction;

    private Double zScore;

    private Boolean iqrFlag;

    private Integer fraudScore;

    private Boolean isolationFlag;

    private Boolean isAnomaly;

    private LocalDateTime createdAt;

    @Column(length = 500)
    private String reason;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}

