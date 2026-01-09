package com.example.fraud_detection.controller;

import com.example.fraud_detection.entity.Admin;
import com.example.fraud_detection.entity.User;
import com.example.fraud_detection.repository.AdminRepository;
import com.example.fraud_detection.repository.UserRepository; 
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    // 1. API Đăng nhập cho ADMIN
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest request) {
        Admin admin = adminRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (admin == null || !admin.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(401).body("Sai tài khoản hoặc mật khẩu Admin!");
        }
        return ResponseEntity.ok(admin);
    }

    // 2. API Đăng nhập cho USER
    @PostMapping("/user/login")
    public ResponseEntity<?> userLogin(@RequestBody LoginRequest request) {
        // Tìm User trong bảng users
        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        // Kiểm tra mật khẩu
        if (user == null || !user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(401).body("Sai tài khoản hoặc mật khẩu User!");
        }

        // Thành công -> Trả về thông tin User
        return ResponseEntity.ok(user);
    }

    // DTO dùng chung cho cả 2 API
    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }
}
