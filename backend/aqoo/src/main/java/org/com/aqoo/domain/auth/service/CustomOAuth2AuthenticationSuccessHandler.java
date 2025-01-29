package org.com.aqoo.domain.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.com.aqoo.domain.auth.dto.LoginResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@AllArgsConstructor
public class CustomOAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        System.out.println("successHandler 동작");
        // 1. Authentication 객체에서 OAuth2User 정보 가져오기
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // 2. 사용자 식별을 위한 email 가져오기
        // 네이버의 경우 response 객체 안에 email이 포함되어 있음
        String email;

        if (oAuth2User.getAttribute("email") != null) {
            // 구글의 경우 바로 email을 가져올 수 있음
            email = oAuth2User.getAttribute("email");
        } else if (oAuth2User.getAttribute("response") != null) {
            // 네이버의 경우 response 객체에서 email 추출
            Map<String, Object> responseMap = oAuth2User.getAttribute("response");
            email = (String) responseMap.get("email");
        } else {
            throw new IllegalArgumentException("Email not found in OAuth2 response");
        }

        System.out.println("Extracted email: " + email);

        // 3. JWT AccessToken 생성
        LoginResponse loginResponse = authService.handleOAuthLogin(email);

        // 4. RefreshToken DB에 있다면 꺼내거나 없으면 생성
        String refreshToken = authService.getRefreshToken(email);

        // 5. RefreshToken을 쿠키로 생성해서 담기
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
//                .secure(true) // HTTPS 사용 시 활성화
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .build();

        // 스프링 MVC가 아닌 Servlet API 직접 쓰므로, 헤더에 쿠키 세팅
        response.addHeader("Set-Cookie", refreshTokenCookie.toString());

        // 6. 바로 클라이언트에 JSON으로 응답을 내려도 되고
        //    리다이렉트해서 원하는 URL로 보낸 후에 프론트에서 /oauth2/success 호출하도록 해도 됩니다.

        // (a) 바로 JSON 응답을 내리고 싶다면
        // Content-Type 설정
        response.setContentType("application/json;charset=UTF-8");
        // JSON 직렬화
        new ObjectMapper().writeValue(response.getWriter(), loginResponse);

        // (b) 혹은 리다이렉트 처리 (예: 프론트엔드 페이지)
        // response.sendRedirect("http://localhost:3000/oauth2/success?token=" + loginResponse.getAccessToken());
    }
}
