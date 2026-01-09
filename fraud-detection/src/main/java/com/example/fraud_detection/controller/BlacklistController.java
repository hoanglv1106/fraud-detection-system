package com.example.fraud_detection.controller;

import com.example.fraud_detection.dto.request.BlacklistRequest;
import com.example.fraud_detection.dto.response.BlacklistResponse; 
import com.example.fraud_detection.service.BlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/blacklist")
@RequiredArgsConstructor
public class BlacklistController {

    private final BlacklistService blacklistService;

    // GET: Lấy danh sách
    @GetMapping

    public ResponseEntity<List<BlacklistResponse>> getAll() {
        return ResponseEntity.ok(blacklistService.getAll());
    }

    // POST: Thêm mới
    @PostMapping
    public ResponseEntity<?> add(@RequestBody BlacklistRequest req) {
        try {
            return ResponseEntity.ok(blacklistService.addManual(req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT: Sửa
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody BlacklistRequest req) {
        try {
            return ResponseEntity.ok(blacklistService.update(id, req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DELETE: Xóa
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            blacklistService.delete(id);
            return ResponseEntity.ok("Đã xóa khỏi danh sách đen");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
