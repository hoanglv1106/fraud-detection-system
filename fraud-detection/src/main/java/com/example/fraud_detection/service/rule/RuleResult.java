package com.example.fraud_detection.service.rule;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RuleResult {

    private boolean blocked;   // true = chặn ngay
    private String reason;     // lý do
    private int score;         // điểm gian lận cộng thêm

    public static RuleResult pass() {
        return new RuleResult(false, null, 0);
    }

    public static RuleResult block(String reason, int score) {
        return new RuleResult(true, reason, score);
    }

    // constructor + getter
}
