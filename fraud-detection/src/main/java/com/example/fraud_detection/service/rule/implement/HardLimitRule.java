package com.example.fraud_detection.service.rule.implement;

import com.example.fraud_detection.entity.Transaction;
import com.example.fraud_detection.service.rule.FraudRule;
import com.example.fraud_detection.service.rule.RuleResult;
import org.springframework.stereotype.Component;

@Component
public class HardLimitRule implements FraudRule {

    private static final double MAX_AMOUNT = 1_000_000_000; // 1 tỷ

    @Override
    public RuleResult evaluate(Transaction tx) {
        if (tx.getAmount() > MAX_AMOUNT) {
            return RuleResult.block("Amount exceeds hard limit", 90);
        }
        return RuleResult.pass();
    }
}
