# 01/20

# 아이디어 확정

# 기능 명세서 작성

- 기능 확정 및 기능 명세서 작성함.

# 화면 설계

# DB 설계

```java
-- 기존 스키마 삭제
DROP SCHEMA IF EXISTS AQOO;

-- 새로운 스키마 생성
CREATE SCHEMA AQOO;
USE AQOO;

-- 물고기 타입 테이블 생성 (먼저 생성)
CREATE TABLE fish_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255),
    fish_name VARCHAR(100)
);

-- 사용자 테이블 생성
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pw VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(50),
    main_fish_id INT, -- 참조 키 추가
    experience INT DEFAULT 0,
    level INT DEFAULT 1,
    FOREIGN KEY (main_fish_id) REFERENCES fish_type(id) -- 물고기 타입 테이블 참조
);

-- 어항 테이블 생성
CREATE TABLE aquarium (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aquarium_name VARCHAR(255),
    last_fed_time DATETIME,
    last_water_change_time DATETIME,
    water_condition INT, -- INT 타입으로 변경
    last_cleaned_time DATETIME,
    pollution_status INT, -- INT 타입으로 변경
    user_id INT NOT NULL, -- 사용자 테이블 참조
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 사용자 물고기 테이블 생성
CREATE TABLE user_fish (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fish_type_id INT NOT NULL,
    user_id INT NOT NULL,
    aquarium_id INT NOT NULL, -- 어항 테이블 참조
    FOREIGN KEY (fish_type_id) REFERENCES fish_type(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (aquarium_id) REFERENCES aquarium(id)
);

-- 친구 관계 테이블 생성
CREATE TABLE friend_relationship (
    id INT AUTO_INCREMENT PRIMARY KEY,
    friend1_id INT NOT NULL,
    friend2_id INT NOT NULL,
    status VARCHAR(50),
    FOREIGN KEY (friend1_id) REFERENCES user(id),
    FOREIGN KEY (friend2_id) REFERENCES user(id)
);

-- 알림 테이블 생성
CREATE TABLE notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 채팅방 테이블 생성
CREATE TABLE chat_room (
    id INT AUTO_INCREMENT PRIMARY KEY
);

-- 채팅방 멤버 테이블 생성
CREATE TABLE chat_room_member (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_room_id INT NOT NULL,
    participant_id INT NOT NULL,
    FOREIGN KEY (chat_room_id) REFERENCES chat_room(id),
    FOREIGN KEY (participant_id) REFERENCES user(id)
);

```

- 기능에 필요한 데이터베이스 확정 및 설계