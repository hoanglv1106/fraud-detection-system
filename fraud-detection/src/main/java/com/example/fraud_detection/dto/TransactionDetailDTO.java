package com.example.fraud_detection.dto;

import com.example.fraud_detection.Type.TransactionStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionDetailDTO {
    // 1. Thông tin giao dịch cơ bản
    private Long id;
    private Double amount;
    private TransactionStatus status;
    private LocalDateTime timestamp;
    private String location;
    private String device;

    // 2. Thông tin User (Để hiển thị trên Modal)
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;

    // 3. Thông tin AI thực tế (Lấy từ FraudResult)
    private Double zScore;
    private Integer fraudScore;
    private String aiReason; // Lý do cụ thể (VD: "Z-Score > 3", "Blacklist IP")
    private Boolean isAnomaly;
}