package com.example.fraud_detection.repository;



import com.example.fraud_detection.Type.TransactionStatus;
import com.example.fraud_detection.dto.DailyVolumeStat;
import com.example.fraud_detection.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByStatus(TransactionStatus status);
    // Lấy danh sách các giao dịch "Có vấn đề" (Fraud hoặc Review) mới nhất
    // Giới hạn 20 cái gần nhất để hiển thị notification
    List<Transaction> findTop20ByStatusInOrderByTimestampDesc(List<TransactionStatus> statuses);

    @Query("""
SELECT COUNT(t)
FROM Transaction t
WHERE t.user.id = :userId
AND t.timestamp >= :fromTime
""")
    long countRecentTransactions(
            @Param("userId") Long userId,
            @Param("fromTime") LocalDateTime fromTime
    );

    long countByStatus(TransactionStatus status);

    @Query("SELECT SUM(t.amount) FROM Transaction t")
    Double getTotalVolume();


    @Query(value = """
        SELECT 
            DATE_FORMAT(t.timestamp, '%d/%m') as date, 
            SUM(t.amount) as amount 
        FROM transactions t
        WHERE t.timestamp >= (CURDATE() - INTERVAL 7 DAY) 
        GROUP BY DATE_FORMAT(t.timestamp, '%d/%m') 
        ORDER BY MIN(t.timestamp) ASC
    """, nativeQuery = true)
    List<DailyVolumeStat> getDailyVolumeLast7Days();

}
