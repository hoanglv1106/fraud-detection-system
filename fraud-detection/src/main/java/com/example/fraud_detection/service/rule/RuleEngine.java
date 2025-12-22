package com.example.fraud_detection.service.rule;

import com.example.fraud_detection.entity.Transaction;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RuleEngine {

    private final List<FraudRule> rules;

    public RuleEngine(List<FraudRule> rules) {
        this.rules = rules;
    }

    public RuleResult evaluate(Transaction tx) {

        for (FraudRule rule : rules) {
            RuleResult result = rule.evaluate(tx);
            if (result.isBlocked()) {
                return result; // fail-fast
            }
        }

        return RuleResult.pass();
    }
}
