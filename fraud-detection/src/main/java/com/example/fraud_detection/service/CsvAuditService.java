package com.example.fraud_detection.service;

import com.example.fraud_detection.entity.FraudResult;
import com.example.fraud_detection.entity.Transaction;
import com.example.fraud_detection.entity.User;
import com.example.fraud_detection.repository.TransactionRepository;
import com.opencsv.CSVParser;
import com.opencsv.CSVParserBuilder;
import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CsvAuditService {

    private final FraudDetectionService fraudDetectionService;
    private final TransactionRepository transactionRepository;

    public ByteArrayInputStream auditCsvAndExportExcel(MultipartFile file) {
        try (
                InputStreamReader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
                // CẤU HÌNH CỨNG: Bắt buộc dùng dấu phẩy ',' để tách cột
                // Giúp tránh lỗi nếu Excel lưu file dùng dấu chấm phẩy ';'
                ByteArrayOutputStream out = new ByteArrayOutputStream()
        ) {
            CSVParser parser = new CSVParserBuilder().withSeparator(',').build();
            CSVReader csvReader = new CSVReaderBuilder(reader).withCSVParser(parser).build();

            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Audit Report");

            // --- HEADER EXCEL ---
            Row headerRow = sheet.createRow(0);
            String[] columns = {"User ID", "Amount", "Device", "Location", "Timestamp", "Fraud Score", "Result", "Reason"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                CellStyle style = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            // --- ĐỌC CSV ---
            List<String[]> rows = csvReader.readAll();
            int rowIndex = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            for (String[] rowData : rows) {


                // 1. Check dữ liệu rỗng
                if (rowData == null || rowData.length == 0) continue;

                // 2. Check dòng Header (bỏ qua)
                String firstColumn = rowData[0].trim().replaceAll("[^a-zA-Z0-9]", "");
                if (rowIndex == 1 && (firstColumn.equalsIgnoreCase("id") || firstColumn.equalsIgnoreCase("userid"))) {
                    continue;
                }

                // 3. DEBUG: Check số lượng cột
                if (rowData.length < 6) {
                    Row errorRow = sheet.createRow(rowIndex++);
                    // Ghi lại toàn bộ nội dung dòng đó để xem nó đang đọc cái gì
                    String rawLine = Arrays.toString(rowData);
                    errorRow.createCell(7).setCellValue("Lỗi định dạng: Tìm thấy " + rowData.length + " cột (Yêu cầu 6). Nội dung: " + rawLine);
                    continue;
                }

                try {
                    // Mapping: 0:id, 1:amount, 2:device, 3:location, 4:timestamp, 5:user_id

                    // Parse Data
                    String amountStr = rowData[1].trim();
                    Double amount = Double.parseDouble(amountStr);

                    String device = rowData[2].trim();
                    String location = rowData[3].trim();
                    String timeStr = rowData[4].trim();
                    String userIdStr = rowData[5].trim();
                    Long userId = Long.parseLong(userIdStr);

                    // Parse Time
                    LocalDateTime timestamp;
                    try {
                        timestamp = LocalDateTime.parse(timeStr, formatter);
                    } catch (Exception e) {
                        timestamp = LocalDateTime.now(); // Fallback nếu lỗi ngày giờ
                    }


                    User mockUser = new User();
                    mockUser.setId(userId);

                    Transaction tempTx = Transaction.builder()
                            .user(mockUser)
                            .amount(amount)
                            .location(location)
                            .device(device)
                            .timestamp(timestamp)
                            .build();

                    List<Transaction> history = transactionRepository.findByUserId(userId);
                    FraudResult result = fraudDetectionService.calculateFraud(tempTx, history);


                    Row excelRow = sheet.createRow(rowIndex++);
                    excelRow.createCell(0).setCellValue(userId);
                    excelRow.createCell(1).setCellValue(amount);
                    excelRow.createCell(2).setCellValue(device);
                    excelRow.createCell(3).setCellValue(location);
                    excelRow.createCell(4).setCellValue(timestamp.toString());
                    excelRow.createCell(5).setCellValue(result.getFraudScore());

                    Cell resultCell = excelRow.createCell(6);
                    if (result.getIsAnomaly()) {
                        resultCell.setCellValue("FRAUD");
                    } else {
                        resultCell.setCellValue("SAFE");
                    }
                    excelRow.createCell(7).setCellValue(result.getReason());

                } catch (Exception e) {
                    Row errorRow = sheet.createRow(rowIndex++);
                    errorRow.createCell(7).setCellValue("Lỗi xử lý dòng này: " + e.getMessage());
                }
            }

            for(int i=0; i<columns.length; i++) sheet.autoSizeColumn(i);
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Lỗi file: " + e.getMessage());
        }
    }
}