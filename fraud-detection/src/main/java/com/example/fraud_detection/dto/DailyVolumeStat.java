package com.example.fraud_detection.dto;

public interface DailyVolumeStat {
    String getDate();   // Trả về ngày (VD: "18/12")
    Double getAmount(); // Trả về tổng tiền (VD: 50000000)
}