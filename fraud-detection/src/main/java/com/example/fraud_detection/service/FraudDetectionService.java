package com.example.fraud_detection.service;

import com.example.fraud_detection.entity.FraudResult;
import com.example.fraud_detection.entity.Transaction;
import com.example.fraud_detection.repository.FraudResultRepository;
import com.example.fraud_detection.service.detector.IQRDetector;
import com.example.fraud_detection.service.detector.IsolationDetector;
import com.example.fraud_detection.service.detector.ZScoreDetector;
import com.example.fraud_detection.service.rule.RuleEngine;
import com.example.fraud_detection.service.rule.RuleResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final ZScoreDetector zScoreDetector;
    private final IQRDetector iqrDetector;
    private final IsolationDetector isolationDetector;
    private final FraudResultRepository fraudResultRepository;
    private final RuleEngine ruleEngine;

    /**
     * Hàm dùng cho GIAO DỊCH THẬT (Real-time).
     * Có tính toán và CÓ LƯU vào Database.
     */
    public FraudResult analyze(Transaction newTransaction, List<Transaction> history) {
        // 1. Gọi logic tính toán
        FraudResult result = calculateFraud(newTransaction, history);

        // 2. Lưu vào DB (Chỉ giao dịch thật mới lưu)
        return fraudResultRepository.save(result);
    }


    public FraudResult calculateFraud(Transaction newTransaction, List<Transaction> history) {

        //  KIỂM TRA LUẬT CỨNG (FAIL-FAST)
        RuleResult ruleResult = ruleEngine.evaluate(newTransaction);

        if (ruleResult.isBlocked()) {
            // Trả về kết quả ngay, nhưng KHÔNG gọi repository.save() ở đây
            return FraudResult.builder()
                    .transaction(newTransaction)
                    .fraudScore(ruleResult.getScore()) // 100
                    .isAnomaly(true)
                    .reason(ruleResult.getReason())
                    .build();
        }

        //  PHÂN TÍCH CHUYÊN SÂU (AI & THỐNG KÊ)
        double zScore = zScoreDetector.calculateZScore(newTransaction.getAmount(), history);
        boolean zAnomaly = zScoreDetector.isAnomaly(zScore);

        boolean iqrAnomaly = iqrDetector.isAnomaly(newTransaction.getAmount(), history);

        boolean isolationAnomaly = isolationDetector.isAnomaly(newTransaction, history);

        // Tính điểm Fraud Score
        int fraudScore = 0;
        List<String> reasons = new ArrayList<>();

        if (zAnomaly) {
            fraudScore += 40;
            reasons.add("Z-Score High");
        }
        if (iqrAnomaly) {
            fraudScore += 30;
            reasons.add("IQR Anomaly");
        }
        if (isolationAnomaly) {
            fraudScore += 30;
            reasons.add("Isolation Forest Anomaly");
        }

        boolean isAnomaly = fraudScore >= 60;
        String finalReason = reasons.isEmpty() ? "Safe" : String.join("; ", reasons);

        // Trả về Object kết quả (để thằng gọi tự quyết định làm gì tiếp theo)
        return FraudResult.builder()
                .transaction(newTransaction)
                .zScore(zScore)
                .iqrFlag(iqrAnomaly)
                .isolationFlag(isolationAnomaly)
                .fraudScore(fraudScore)
                .isAnomaly(isAnomaly)
                .reason(finalReason)
                .build();
    }
}