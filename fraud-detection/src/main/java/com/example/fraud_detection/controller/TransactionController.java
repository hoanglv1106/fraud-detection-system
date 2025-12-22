package com.example.fraud_detection.controller;


import com.example.fraud_detection.dto.request.TransactionRequest;
import com.example.fraud_detection.entity.Transaction;
import com.example.fraud_detection.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public Transaction create(@RequestBody @Valid TransactionRequest request) {
        return transactionService.createTransaction(request);
    }

    @GetMapping("/user/{userId}")
    public List<Transaction> getByUser(@PathVariable Long userId) {
        return transactionService.getTransactionHistory(userId);
    }
}

