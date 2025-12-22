package com.example.fraud_detection.controller;

import com.example.fraud_detection.dto.response.FraudResponse;
import com.example.fraud_detection.entity.FraudResult;
import com.example.fraud_detection.repository.FraudResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/fraud")
@RequiredArgsConstructor
public class FraudController {

    private final FraudResultRepository fraudResultRepository;

    @GetMapping("/{transactionId}")
    public FraudResponse getFraudResult(@PathVariable Long transactionId) {

        FraudResult result = fraudResultRepository
                .findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Chưa có kết quả phân tích cho giao dịch này"));

        return FraudResponse.builder()
                .transactionId(transactionId)
                .zScore(result.getZScore())
                .iqrFlag(result.getIqrFlag())
                .isolationFlag(result.getIsolationFlag())
                .fraudScore(result.getFraudScore())
                .isAnomaly(result.getIsAnomaly())
                .reason(result.getReason())
                .build();
    }
}