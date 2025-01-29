package org.com.aqoo.domain.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/protected")
public class ProtectedController {

    // 임시 테스트 API: 보호된 리소스
    @GetMapping("/resource")
    public String getProtectedResource() {
        System.out.println("리소스 실행");
        return "This is a protected resource!";
    }
}
