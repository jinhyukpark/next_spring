package com.example.auth.controller;

import com.example.auth.dto.ApiResponse;
import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.entity.User;
import com.example.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User newUser = userService.createUser(request);
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", newUser.getId());
            userData.put("username", newUser.getName());
            userData.put("email", newUser.getEmail());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("회원가입이 성공적으로 완료되었습니다!", userData));
                
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 오류가 발생했습니다"));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("이메일 또는 비밀번호가 올바르지 않습니다"));
            
            if (!user.getIsActive()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("비활성화된 계정입니다"));
            }
            
            if (!userService.validatePassword(request.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("이메일 또는 비밀번호가 올바르지 않습니다"));
            }
            
            // 마지막 로그인 시간 업데이트
            userService.updateLastLogin(user.getId());
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("name", user.getName());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());
            
            return ResponseEntity.ok(ApiResponse.success("로그인 성공!", userData));
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 오류가 발생했습니다"));
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllUsers() {
        try {
            List<User> users = userService.findAllUsers();
            long count = userService.countUsers();
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("data", users);
            responseData.put("count", count);
            
            return ResponseEntity.ok(ApiResponse.success("사용자 목록 조회 성공", responseData));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 오류가 발생했습니다"));
        }
    }
    
    @GetMapping("/profile/{id}")
    public ResponseEntity<ApiResponse<User>> getUserProfile(@PathVariable Long id) {
        try {
            User user = userService.findById(id)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
            
            return ResponseEntity.ok(ApiResponse.success("사용자 정보 조회 성공", user));
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 오류가 발생했습니다"));
        }
    }
    
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifySession() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("인증되지 않은 사용자입니다"));
            }
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("email", authentication.getName());
            
            return ResponseEntity.ok(ApiResponse.success("유효한 세션입니다", userData));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("서버 오류가 발생했습니다"));
        }
    }
    
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getApiInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("message", "🚀 Spring Boot + MariaDB 회원가입 서비스가 실행 중입니다!");
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("register", "POST /api/auth/register");
        endpoints.put("login", "POST /api/auth/login");
        endpoints.put("profile", "GET /api/auth/profile/{id}");
        endpoints.put("users", "GET /api/auth/users");
        
        info.put("endpoints", endpoints);
        info.put("timestamp", java.time.LocalDateTime.now().toString());
        
        return ResponseEntity.ok(ApiResponse.success("API 정보 조회 성공", info));
    }
}
