# 1. Node.js 공식 이미지 사용 (Next.js 권장 버전)
FROM node:18-alpine AS builder

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 전체 소스 코드 복사 (package.json, package-lock.json, 그리고 나머지 소스)
COPY aqoo-fe/ /app/

# 4. 의존성 설치
RUN npm install

# 5. Next.js 앱 빌드
RUN npm run build

# 6. nginx 설치
FROM nginx:alpine

# 7. 빌드된 결과물 복사
COPY --from=builder /app/.next /usr/share/nginx/html/.next
COPY --from=builder /app/public /usr/share/nginx/html/public
COPY --from=builder /app/package.json /usr/share/nginx/html/package.json
COPY nginx.conf /etc/nginx/nginx.conf

# 8. 환경 변수 설정
ENV PORT=80
EXPOSE 80

# 9. nginx 실행
CMD ["nginx", "-g", "daemon off;"]
