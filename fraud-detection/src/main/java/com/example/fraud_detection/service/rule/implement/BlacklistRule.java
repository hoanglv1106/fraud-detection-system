package com.example.fraud_detection.service.rule.implement;

import com.example.fraud_detection.Type.BlacklistType;
import com.example.fraud_detection.entity.Transaction;
import com.example.fraud_detection.repository.BlacklistRepository;
import com.example.fraud_detection.service.rule.FraudRule;
import com.example.fraud_detection.service.rule.RuleResult;
import org.springframework.stereotype.Component;

@Component
public class BlacklistRule implements FraudRule {

    private final BlacklistRepository blacklistRepo;

    public BlacklistRule(BlacklistRepository blacklistRepo) {
        this.blacklistRepo = blacklistRepo;
    }

    @Override
    public RuleResult evaluate(Transaction tx) {

        // Check USER
        if (blacklistRepo.existsByTypeAndValueAndActiveTrue(
                BlacklistType.USER,
                tx.getUser().getId().toString()
        )) {
            return RuleResult.block("User is blacklisted", 100);
        }

        // Check IP
        if (tx.getLocation() != null &&
                blacklistRepo.existsByTypeAndValueAndActiveTrue(
                        BlacklistType.IP,
                        tx.getLocation()
                )) {
            return RuleResult.block("IP is blacklisted", 100);
        }

        // Check DEVICE
        if (tx.getDevice() != null &&
                blacklistRepo.existsByTypeAndValueAndActiveTrue(
                        BlacklistType.DEVICE,
                        tx.getDevice()
                )) {
            return RuleResult.block("Device is blacklisted", 100);
        }

        return RuleResult.pass();
    }
}
