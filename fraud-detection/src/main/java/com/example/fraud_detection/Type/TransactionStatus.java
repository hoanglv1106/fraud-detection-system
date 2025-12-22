package com.example.fraud_detection.Type;


public enum TransactionStatus {
    PENDING,        // Đang chờ xử lý
    APPROVED,       // Đã duyệt thành công
    REJECTED_FRAUD, // Bị hệ thống chặn tự động
    MANUAL_REVIEW   // <--- THÊM MỚI: Chờ Admin duyệt tay
}
