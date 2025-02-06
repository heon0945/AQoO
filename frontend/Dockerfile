# 1. Next.js 빌드를 위한 Node.js 이미지 사용
FROM node:18-alpine AS builder

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. Next.js 프로젝트 복사 (aqoo-fe 폴더를 고려하여 수정)
COPY aqoo-fe/ /app/

# 4. 의존성 설치
RUN npm install

# 5. Next.js 정적 파일 빌드 (next export 사용)
RUN npm run build
#RUN npm run export

# 6. Nginx를 사용하는 이미지로 변경
FROM nginx:alpine

# 7. Nginx 설정 파일 복사 (nginx.conf를 원하는 대로 적용)
# COPY nginx.conf /etc/nginx/nginx.conf

# 8. Next.js 정적 파일을 Nginx 기본 html 폴더로 복사
COPY --from=builder /app/out /usr/share/nginx/html

# 9. 컨테이너 실행 시 Nginx 실행
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
