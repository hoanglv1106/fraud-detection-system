package com.example.fraud_detection.service.rule;

import com.example.fraud_detection.entity.Transaction;

public interface FraudRule {
    RuleResult evaluate(Transaction transaction);
}
