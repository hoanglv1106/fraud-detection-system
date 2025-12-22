package com.example.fraud_detection.repository;

import com.example.fraud_detection.Type.BlacklistType;
import com.example.fraud_detection.entity.Blacklist;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlacklistRepository extends JpaRepository<Blacklist, Long> {
    boolean existsByTypeAndUser_IdAndActiveTrue(BlacklistType type, Long userId);
    boolean existsByTypeAndValueAndActiveTrue(
            BlacklistType type,
            String value
    );

}
