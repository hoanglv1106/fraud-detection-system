package com.example.fraud_detection.service;

import com.example.fraud_detection.Type.BlacklistType;
import com.example.fraud_detection.dto.request.BlacklistRequest;
import com.example.fraud_detection.dto.response.BlacklistResponse;
import com.example.fraud_detection.entity.Blacklist;
import com.example.fraud_detection.entity.User;
import com.example.fraud_detection.repository.BlacklistRepository;
import com.example.fraud_detection.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BlacklistService {

    private final BlacklistRepository blacklistRepository;
    private final UserRepository userRepository;

    // 1. Lấy danh sách
    public List<BlacklistResponse> getAll() {
        List<Blacklist> rawList = blacklistRepository.findAll();

        // Convert sang DTO để Frontend hiển thị
        return rawList.stream().map(item -> {
            BlacklistResponse.BlacklistResponseBuilder dto = BlacklistResponse.builder()
                    .id(item.getId())
                    .type(item.getType())
                    .reason(item.getReason())
                    .createdAt(item.getCreatedAt());

            if (item.getType() == BlacklistType.USER && item.getUser() != null) {
                // Lấy thông tin từ quan hệ User
                dto.value(item.getUser().getId().toString()); // Value là ID
                dto.userName(item.getUser().getName());
                dto.userEmail(item.getUser().getEmail());
            } else {
                // Lấy từ cột value (IP/Device)
                dto.value(item.getValue());
                dto.userName("N/A");
                dto.userEmail("N/A");
            }
            return dto.build();
        }).collect(Collectors.toList());
    }


    @Transactional
    public Blacklist addManual(BlacklistRequest req) {
        Blacklist bl = new Blacklist();
        bl.setType(req.getType());
        bl.setReason(req.getReason());
        bl.setActive(true);

        if (req.getType() == BlacklistType.USER) {
            // --- XỬ LÝ USER (Dùng Khóa Ngoại) ---
            Long userId = Long.parseLong(req.getValue());

            // Validate: Nếu user đã bị chặn
            if (blacklistRepository.existsByTypeAndUser_IdAndActiveTrue(BlacklistType.USER, userId)) {
                throw new IllegalArgumentException("User ID " + userId + " đã bị chặn rồi!");
            }

            // Tìm User
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User ID không tồn tại!"));

            bl.setUser(user); // Set quan hệ
            bl.setValue(null); // Cột value để trống

        } else {
            // --- XỬ LÝ IP/DEVICE ---
            if (blacklistRepository.existsByTypeAndValueAndActiveTrue(req.getType(), req.getValue())) {
                throw new IllegalArgumentException(req.getType() + " này đã bị chặn rồi!");
            }
            bl.setValue(req.getValue());
            bl.setUser(null);
        }

        return blacklistRepository.save(bl);
    }


    @Transactional
    public Blacklist update(Long id, BlacklistRequest req) {
        Blacklist existing = blacklistRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy ID blacklist: " + id));

        existing.setReason(req.getReason());
        // Cho phép sửa value nếu cần, hoặc khóa lại tùy nghiệp vụ
        existing.setValue(req.getValue());

        return blacklistRepository.save(existing);
    }

    // 4. Xóa
    @Transactional
    public void delete(Long id) {
        Blacklist existing = blacklistRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy ID blacklist: " + id));


        blacklistRepository.delete(existing);


    }
}