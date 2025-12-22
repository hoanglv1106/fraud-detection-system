package com.example.fraud_detection.dto.response;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FraudResponse {

    private Long transactionId;
    private Double zScore;
    private Boolean iqrFlag;
    private Boolean isolationFlag;
    private Integer fraudScore;
    private Boolean isAnomaly;
    private String reason;
}

