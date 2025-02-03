# 1. Node.js 공식 이미지 사용 (Next.js 권장 버전)
FROM node:18-alpine AS builder

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. package.json과 lock 파일 복사 후 의존성 설치
COPY aqoo-fe/package.json aqoo-fe/package-lock.json ./  # package.json과 package-lock.json만 복사
RUN npm install  # 의존성 설치

# 4. 프로젝트 소스 코드 복사
COPY aqoo-fe/ ./  # 나머지 소스 코드 복사

# 5. Next.js 앱 빌드
RUN npm run build  # 빌드 단계 실행

# 6. 실행을 위한 환경 설정
FROM node:18-alpine AS runner
WORKDIR /app

# 7. 빌드된 결과물 복사
COPY --from=builder /app/.next .next  # 빌드된 Next.js 앱 복사
COPY --from=builder /app/node_modules node_modules  # 의존성 복사
COPY --from=builder /app/public public  # public 폴더 복사
COPY --from=builder /app/package.json package.json  # package.json 복사

# 8. 환경 변수 설정
ENV PORT=3000
EXPOSE 3000

# 9. Next.js 실행
CMD ["npm", "start"]  # 앱 실행
