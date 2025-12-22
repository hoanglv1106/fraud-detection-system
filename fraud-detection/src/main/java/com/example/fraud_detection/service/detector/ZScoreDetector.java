package com.example.fraud_detection.service.detector;

import com.example.fraud_detection.entity.Transaction;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ZScoreDetector {

    public double calculateZScore(double amount, List<Transaction> history) {

        if (history.size() < 2) {
            return 0.0; // chưa đủ dữ liệu
        }

        // 1. Tính Mean (Trung bình)
        double mean = history.stream()
                .mapToDouble(Transaction::getAmount)
                .average()
                .orElse(0.0);

        // 2. Tính Variance (Phương sai)
        double variance = history.stream()
                .mapToDouble(t -> Math.pow(t.getAmount() - mean, 2))
                .average()
                .orElse(0.0);

        // 3. Tính Standard Deviation (Độ lệch chuẩn)
        double std = Math.sqrt(variance);


        if (std == 0) {
            // Trường hợp đặc biệt: Lịch sử "đều tăm tắp" (StdDev = 0)
            // Ví dụ: [50k, 50k, 50k] -> Mean = 50k, Std = 0

            if (amount == mean) {
                return 0.0; // Giao dịch mới cũng 50k -> An toàn
            } else {

                return 100.0;
            }
        }

        return (amount - mean) / std;
    }

    public boolean isAnomaly(double zScore) {

        return Math.abs(zScore) > 3;
    }
}