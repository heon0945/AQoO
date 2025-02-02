# 1. OpenJDK 이미지를 기반으로 사용 (JDK 17 버전 사용)
FROM openjdk:17-jdk-slim AS build

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. Gradle Wrapper와 프로젝트 빌드 파일 복사
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle .
COPY settings.gradle .

# 4. Gradle을 통해 의존성 설치 및 빌드
RUN ./gradlew build --no-daemon

# 5. 실행할 스프링 부트 JAR 파일을 복사
COPY build/libs/*.jar /app/application.jar

# 6. 애플리케이션 실행 명령어
CMD ["java", "-jar", "application.jar"]
