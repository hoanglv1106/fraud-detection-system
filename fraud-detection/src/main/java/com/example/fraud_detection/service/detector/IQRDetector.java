package com.example.fraud_detection.service.detector;

import com.example.fraud_detection.entity.Transaction;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class IQRDetector {

    public boolean isAnomaly(double amount, List<Transaction> history) {

        if (history.size() < 4) {
            return false;
        }

        double[] values = history.stream()
                .mapToDouble(Transaction::getAmount)
                .sorted()
                .toArray();

        int n = values.length;

        double q1 = values[n / 4];
        double q3 = values[(3 * n) / 4];

        double iqr = q3 - q1;

        double lower = q1 - 1.5 * iqr;
        double upper = q3 + 1.5 * iqr;

        return amount < lower || amount > upper;
    }
}
