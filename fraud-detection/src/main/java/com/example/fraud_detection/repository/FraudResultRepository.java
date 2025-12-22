package com.example.fraud_detection.repository;

import com.example.fraud_detection.entity.FraudResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FraudResultRepository extends JpaRepository<FraudResult, Long> {
    Optional<FraudResult> findByTransactionId(Long transactionId);

}
