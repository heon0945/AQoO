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

# 6. Next.js 앱 실행을 위한 최소한의 이미지 사용
FROM node:18-alpine AS runner

# 7. 작업 디렉토리 설정
WORKDIR /app

# 8. 빌드된 결과물 복사
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package.json /app/package.json

# 9. Next.js 앱 실행에 필요한 의존성 설치 (production 모드)
RUN npm install --production

# 10. 포트 설정
ENV PORT 3000
EXPOSE 3000

# 11. Next.js 앱 실행
CMD ["npm", "start"]