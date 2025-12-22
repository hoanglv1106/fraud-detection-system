package com.example.fraud_detection.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStats {
    private long totalTransactions;   // Tổng số giao dịch
    private long fraudTransactions;   // Số giao dịch gian lận
    private long manualReviewPending; // Số đơn đang chờ duyệt
    private Double totalVolume;       // Tổng tiền giao dịch toàn hệ thống
}