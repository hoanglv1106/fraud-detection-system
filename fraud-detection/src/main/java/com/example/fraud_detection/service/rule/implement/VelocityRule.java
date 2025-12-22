package com.example.fraud_detection.service.rule.implement;

import com.example.fraud_detection.entity.Transaction;
import com.example.fraud_detection.repository.TransactionRepository;
import com.example.fraud_detection.service.rule.FraudRule;
import com.example.fraud_detection.service.rule.RuleResult;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class VelocityRule implements FraudRule {

    private final TransactionRepository transactionRepo;

    public VelocityRule(TransactionRepository transactionRepo) {
        this.transactionRepo = transactionRepo;
    }

    @Override
    public RuleResult evaluate(Transaction tx) {

        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);

        long count = transactionRepo.countRecentTransactions(
                tx.getUser().getId(),
                oneMinuteAgo
        );

        if (count >= 5) {
            return RuleResult.block("High transaction velocity", 80);
        }

        return RuleResult.pass();
    }
}
