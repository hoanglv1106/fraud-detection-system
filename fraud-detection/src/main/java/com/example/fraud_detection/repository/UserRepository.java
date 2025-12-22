package com.example.fraud_detection.repository;

import com.example.fraud_detection.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Tìm user bằng username để đăng nhập
    Optional<User> findByUsername(String username);
}