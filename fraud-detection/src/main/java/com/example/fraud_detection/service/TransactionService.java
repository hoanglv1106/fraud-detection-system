package com.example.fraud_detection.service;

import com.example.fraud_detection.Type.BlacklistType;
import com.example.fraud_detection.Type.TransactionStatus;
import com.example.fraud_detection.dto.TransactionDetailDTO;
import com.example.fraud_detection.dto.request.TransactionRequest;
import com.example.fraud_detection.entity.Blacklist;
import com.example.fraud_detection.entity.FraudResult;
import com.example.fraud_detection.entity.Transaction;
import com.example.fraud_detection.entity.User;
import com.example.fraud_detection.repository.BlacklistRepository;
import com.example.fraud_detection.repository.FraudResultRepository;
import com.example.fraud_detection.repository.TransactionRepository;
import com.example.fraud_detection.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <--- Dùng cái này chuẩn Spring hơn

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final FraudDetectionService fraudDetectionService;
    private final UserRepository userRepository;
    private final BlacklistRepository blacklistRepository;
    private final FraudResultRepository fraudResultRepository;
    // Định nghĩa ngưỡng điểm
    private static final int THRESHOLD_REVIEW = 60;
    private static final int THRESHOLD_BLOCK = 80;

    @Transactional
    public Transaction createTransaction(TransactionRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));


        List<Transaction> history = transactionRepository.findByUserId(user.getId());

        // 1. Tạo giao dịch PENDING
        Transaction transaction = Transaction.builder()
                .user(user)
                .amount(request.getAmount())
                .location(request.getLocation())
                .device(request.getDevice())
                .status(TransactionStatus.PENDING)
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        // 2. Check Fraud
        FraudResult fraudResult = fraudDetectionService.analyze(savedTransaction, history);

        // 3. Logic chặn/duyệt
        int score = fraudResult.getFraudScore();

        if (score >= THRESHOLD_BLOCK) {
            savedTransaction.setStatus(TransactionStatus.REJECTED_FRAUD);
            // Log lý do chặn
            System.out.println("BLOCKED Transaction " + savedTransaction.getId() + ": Score " + score);

        } else if (score >= THRESHOLD_REVIEW) {
            savedTransaction.setStatus(TransactionStatus.MANUAL_REVIEW);
            System.out.println("REVIEW Transaction " + savedTransaction.getId() + ": Score " + score);

        } else {
            savedTransaction.setStatus(TransactionStatus.APPROVED);
        }

        
        if (score > 90) {
            // 1. Chặn giao dịch ngay lập tức
            savedTransaction.setStatus(TransactionStatus.REJECTED_FRAUD);
            System.out.println("Auto-Block & Blacklist User: Score " + score);

            // 2. Thêm User vào Blacklist (Nếu chưa có)
            String userIdStr = user.getId().toString();
            boolean alreadyBlacklisted = blacklistRepository.existsByTypeAndValueAndActiveTrue(BlacklistType.USER, userIdStr);

            if (!alreadyBlacklisted) {
                Blacklist newBlacklistEntry = new Blacklist();
                newBlacklistEntry.setType(BlacklistType.USER);
                newBlacklistEntry.setValue(userIdStr);
                newBlacklistEntry.setReason("Auto-ban: Fraud Score " + score + " (Extreme High)");
                newBlacklistEntry.setActive(true);
                newBlacklistEntry.setCreatedAt(java.time.LocalDateTime.now());

                blacklistRepository.save(newBlacklistEntry);
                System.out.println("--> User " + userIdStr + " has been added to BLACKLIST.");
            }

        } else if (score >= THRESHOLD_BLOCK) { // 80 -> 90: Chặn nhưng không Blacklist
            savedTransaction.setStatus(TransactionStatus.REJECTED_FRAUD);

        } else if (score >= THRESHOLD_REVIEW) { // 60 -> 79: Review
            savedTransaction.setStatus(TransactionStatus.MANUAL_REVIEW);

        } else { // < 60: Safe
            savedTransaction.setStatus(TransactionStatus.APPROVED);
        }

        // 4. Update trạng thái
        return transactionRepository.save(savedTransaction);
    }


    @Transactional

    public Transaction processManualReview(Long transactionId, boolean isApproved, String adminUsername) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));

        if (tx.getStatus() != TransactionStatus.MANUAL_REVIEW) {
            throw new IllegalStateException("Giao dịch này không ở trạng thái chờ duyệt");
        }

        if (isApproved) {
            tx.setStatus(TransactionStatus.APPROVED);
        } else {
            tx.setStatus(TransactionStatus.REJECTED_FRAUD);
        }

        // --- LƯU VẾT ADMIN ---
        tx.setReviewedBy(adminUsername);
        tx.setReviewedAt(java.time.LocalDateTime.now());
        // ---------------------

        return transactionRepository.save(tx);
    }


    public TransactionDetailDTO getTransactionDetail(Long transactionId) {
        // 1. Tìm giao dịch (Nếu không thấy thì báo lỗi ngay)
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));

        // 2. Tìm kết quả Fraud (Có thể null)
        FraudResult fraudResult = fraudResultRepository.findByTransactionId(transactionId)
                .orElse(null);

        // 3. Xử lý thông tin User an toàn (tránh NullPointer nếu User bị xóa)
        Long userId = null;
        String userName = "N/A";
        String userEmail = "N/A";


        if (tx.getUser() != null) {
            userId = tx.getUser().getId();
            userName = tx.getUser().getName();
            userEmail = tx.getUser().getEmail();

        }

        // 4. Xử lý kết quả AI an toàn (Tránh lỗi Unboxing khi Z-Score bị NULL)
        Double zScore = 0.0;
        Integer fraudScore = 0;
        Boolean isAnomaly = false;
        String reason = "Chưa phân tích";

        if (fraudResult != null) {
            // Chỉ lấy giá trị nếu nó không null, ngược lại dùng mặc định
            zScore = fraudResult.getZScore() != null ? fraudResult.getZScore() : 0.0;
            fraudScore = fraudResult.getFraudScore() != null ? fraudResult.getFraudScore() : 0;
            isAnomaly = fraudResult.getIsAnomaly() != null ? fraudResult.getIsAnomaly() : false;
            reason = fraudResult.getReason() != null ? fraudResult.getReason() : "Không rõ nguyên nhân";
        }

        // 5. Build DTO
        return TransactionDetailDTO.builder()
                .id(tx.getId())
                .amount(tx.getAmount())
                .status(tx.getStatus())
                .timestamp(tx.getTimestamp())
                .location(tx.getLocation())
                .device(tx.getDevice())

                .userId(userId)
                .userName(userName)
                .userEmail(userEmail)


                .zScore(zScore)
                .fraudScore(fraudScore)
                .isAnomaly(isAnomaly)
                .aiReason(reason)
                .build();
    }// Hàm này phải nằm TRONG class
    public List<Transaction> getTransactionHistory(Long userId) {
        return transactionRepository.findByUserId(userId);
    }
}