package com.example.fraud_detection.service.detector;



import com.example.fraud_detection.entity.Transaction;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class IsolationDetector {

    public boolean isAnomaly(Transaction newTx, List<Transaction> history) {

        if (history.isEmpty()) return false;

        boolean locationRare = history.stream()
                .noneMatch(t -> t.getLocation() != null &&
                        t.getLocation().equalsIgnoreCase(newTx.getLocation()));

        boolean deviceRare = history.stream()
                .noneMatch(t -> t.getDevice() != null &&
                        t.getDevice().equalsIgnoreCase(newTx.getDevice()));

        boolean timeRare = isTimeAnomaly(newTx.getTimestamp());

        // rule: 2 trong 3 yếu tố bất thường
        int score = 0;
        if (locationRare) score++;
        if (deviceRare) score++;
        if (timeRare) score++;

        return score >= 2;
    }

    private boolean isTimeAnomaly(LocalDateTime time) {
        int hour = time.getHour();
        return hour < 5 || hour > 23;
    }
}

