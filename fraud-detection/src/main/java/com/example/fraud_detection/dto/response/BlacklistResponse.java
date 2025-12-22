package com.example.fraud_detection.dto.response;

import com.example.fraud_detection.Type.BlacklistType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class BlacklistResponse {
    private Long id;
    private BlacklistType type;

    // Trường này sẽ chứa User ID (nếu là user) hoặc địa chỉ IP/Device (nếu là loại khác)
    private String value;

    private String reason;
    private LocalDateTime createdAt;

    // --- Các thông tin bổ sung của User (Frontend cần để hiển thị tên, email) ---
    private String userName;
    private String userEmail;
    private String userPhone;
}