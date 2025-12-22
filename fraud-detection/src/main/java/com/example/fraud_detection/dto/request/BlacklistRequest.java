package com.example.fraud_detection.dto.request;

import com.example.fraud_detection.Type.BlacklistType;
import lombok.Data;

@Data
public class BlacklistRequest {
    private BlacklistType type; // USER, IP, DEVICE
    private String value;       // VD: "1" (userId), "192.168.1.1"
    private String reason;
}