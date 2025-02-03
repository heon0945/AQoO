# 1. Node.js 공식 이미지 사용 (Next.js 권장 버전)
FROM node:18-alpine AS builder

# 2. 작업 디렉토리 설정
WORKDIR /app1

# 3. 전체 소스 코드 복사 (package.json, package-lock.json, 그리고 나머지 소스)
COPY aqoo-fe/ /app1/  # frontend/aqoo-fe 경로에서 소스를 복사

# 4. 의존성 설치
RUN npm install  # 의존성 설치

# 5. Next.js 앱 빌드
RUN npm run build  # 빌드

# 6. 실행을 위한 환경 설정
FROM node:18-alpine AS runner
WORKDIR /app1  # 실행 디렉토리도 /app1로 설정

# 7. 빌드된 결과물 복사
COPY --from=builder /app1/.next .next
COPY --from=builder /app1/node_modules node_modules
COPY --from=builder /app1/public public
COPY --from=builder /app1/package.json package.json

# 8. 환경 변수 설정
ENV PORT=3000
EXPOSE 3000

# 9. Next.js 실행
CMD ["npm", "start"]
