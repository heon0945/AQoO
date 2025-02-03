package org.com.aqoo.domain.auth.controller;

import lombok.RequiredArgsConstructor;
import org.com.aqoo.domain.auth.dto.ExpUpRequest;
import org.com.aqoo.domain.auth.dto.ExpUpResponse;
import org.com.aqoo.domain.auth.dto.UserInfoResponse;
import org.com.aqoo.domain.auth.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    // 회원정보 조회
    @GetMapping("/{userId}")
    public ResponseEntity<UserInfoResponse> getUserInfo(@PathVariable String userId) {
        UserInfoResponse userInfo = userService.getUserInfo(userId);
        return ResponseEntity.ok(userInfo);
    }

    // 경험치 증가 & 레벨업
    @PostMapping("/exp-up")
    public ResponseEntity<ExpUpResponse> increaseExp(@RequestBody ExpUpRequest request) {
        ExpUpResponse response = userService.increaseUserExp(request);
        return ResponseEntity.ok(response);
    }

}