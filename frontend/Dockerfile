# 1. Node.js 공식 이미지 사용 (Next.js 권장 버전)
FROM node:18-alpine AS builder

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. package.json과 lock 파일 복사 후 의존성 설치
COPY frontend/aqoo-fe/package.json frontend/aqoo-fe/package-lock.json ./  # 상대 경로 수정
RUN npm install

# 4. 프로젝트 소스 코드 복사
COPY frontend/aqoo-fe .  # 상대 경로 수정

# 5. Next.js 앱 빌드
RUN npm run build

# 6. 실행을 위한 환경 설정
FROM node:18-alpine AS runner
WORKDIR /app

# 7. 빌드된 결과물을 복사
COPY --from=builder /app/.next .next
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/public public
COPY --from=builder /app/package.json package.json

# 8. 환경 변수 설정
ENV PORT=3000
EXPOSE 3000

# 9. Next.js 실행
CMD ["npm", "start"]
