package com.example.fraud_detection.controller;

import com.example.fraud_detection.Type.TransactionStatus;
import com.example.fraud_detection.dto.DailyVolumeStat;
import com.example.fraud_detection.dto.DashboardStats; // Nhớ import DTO mới tạo
import com.example.fraud_detection.dto.TransactionDetailDTO;
import com.example.fraud_detection.entity.Transaction;
import com.example.fraud_detection.entity.User;
import com.example.fraud_detection.repository.TransactionRepository;
import com.example.fraud_detection.repository.UserRepository;
import com.example.fraud_detection.service.CsvAuditService;
import com.example.fraud_detection.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final TransactionService transactionService;
    private final TransactionRepository transactionRepository;
    private final CsvAuditService csvAuditService;
    @Autowired
    private UserRepository userRepository;

    // 1. API thống kê Dashboard
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        long total = transactionRepository.count();
        long fraud = transactionRepository.countByStatus(TransactionStatus.REJECTED_FRAUD);
        long pending = transactionRepository.countByStatus(TransactionStatus.MANUAL_REVIEW);

        // Handle trường hợp chưa có giao dịch nào thì trả về 0.0 thay vì null
        Double volume = transactionRepository.getTotalVolume();
        if (volume == null) volume = 0.0;

        DashboardStats stats = DashboardStats.builder()
                .totalTransactions(total)
                .fraudTransactions(fraud)
                .manualReviewPending(pending)
                .totalVolume(volume)
                .build();

        return ResponseEntity.ok(stats);
    }

    // 2. API lấy danh sách chờ duyệt
    @GetMapping("/transactions/pending")
    public List<Transaction> getPendingReviews() {
        return transactionRepository.findByStatus(TransactionStatus.MANUAL_REVIEW);
    }

    // 3. API Duyệt đơn
    @PostMapping("/transactions/{transactionId}/review")
    public ResponseEntity<?> reviewTransaction(
            @PathVariable Long transactionId,
            @RequestParam boolean approve,
            @RequestParam String adminUsername // <--- Yêu cầu Frontend gửi lên
    ) {
        try {
            // Gọi hàm service mới
            Transaction updatedTx = transactionService.processManualReview(transactionId, approve, adminUsername);
            return ResponseEntity.ok(updatedTx);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 4. API Upload CSV Audit
    @PostMapping(value = "/audit/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Resource> uploadCsvAudit(@RequestParam("file") MultipartFile file) {
        ByteArrayInputStream stream = csvAuditService.auditCsvAndExportExcel(file);
        String filename = "audit_report_" + System.currentTimeMillis() + ".xlsx";
        InputStreamResource fileResource = new InputStreamResource(stream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(fileResource);
    }

    @GetMapping("/stats/daily")
    public List<DailyVolumeStat> getDailyStats() {
        return transactionRepository.getDailyVolumeLast7Days();
    }
    @GetMapping("/alerts")
    public List<Transaction> getRecentAlerts() {
        // Lấy 2 trạng thái cần cảnh báo: CHẶN và CHỜ DUYỆT
        List<TransactionStatus> alertStatuses = List.of(
                TransactionStatus.REJECTED_FRAUD,
                TransactionStatus.MANUAL_REVIEW
        );



        // Gọi hàm repository vừa viết
        return transactionRepository.findTop20ByStatusInOrderByTimestampDesc(alertStatuses);
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<TransactionDetailDTO> getTransactionDetails(@PathVariable Long id) {
        try {
            TransactionDetailDTO detail = transactionService.getTransactionDetail(id);
            return ResponseEntity.ok(detail);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {

        return ResponseEntity.ok(userRepository.findAll());
    }


}