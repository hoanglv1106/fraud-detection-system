package com.example.fraud_detection.dto.request;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionRequest {

    @NotNull
    private Long userId;

    @NotNull
    @Positive
    private Double amount;

    private String location;
    private String device;
}

