package org.com.aqoo.domain.gameB.entity;

import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class GamePlayer {
    private String userName;
    private int score;
    private String direction = "IDLE";
    private boolean stunned;
    private long stunEndTime;

    public GamePlayer(String userName) {
        this.userName = userName;
        this.score = 0;
    }

    public void addScore(int points) {
        this.score += points;
    }

    public void stun(int seconds) {
        this.stunned = true;
        this.stunEndTime = System.currentTimeMillis() + seconds * 1000;
        // 스케줄러를 사용하여 일정 시간 후 스턴 해제
        Executors.newSingleThreadScheduledExecutor().schedule(() -> {
            this.stunned = false;
        }, seconds, TimeUnit.SECONDS);
    }

    public boolean isStunned() {
        if (stunned && System.currentTimeMillis() > stunEndTime) {
            stunned = false;
        }
        return stunned;
    }

    // Getter & Setter
    public String getUserName() {
        return userName;
    }
    public int getScore() {
        return score;
    }
    public String getDirection() {
        return direction;
    }
    public void setDirection(String direction) {
        this.direction = direction;
    }
}