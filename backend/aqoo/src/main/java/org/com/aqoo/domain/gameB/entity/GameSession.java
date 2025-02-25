package org.com.aqoo.domain.gameB.entity;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class GameSession {
    private String roomId;
    private String hostUserName;
    private Map<String, GamePlayer> players = new ConcurrentHashMap<>();
    private long startTime;
    private boolean running;

    public GameSession(String roomId, String hostUserName) {
        this.roomId = roomId;
        this.hostUserName = hostUserName;
        // 게임 시작 시 호스트 플레이어를 초기화
        players.put(hostUserName, new GamePlayer(hostUserName));
    }

    public void start() {
        this.startTime = System.currentTimeMillis();
        this.running = true;
    }

    public void end() {
        this.running = false;
    }

    public void updatePlayerDirection(String userName, String direction) {
        GamePlayer player = players.get(userName);
        if (player != null && !player.isStunned()) {
            player.setDirection(direction);
        }
    }

    public void addScore(String userName, int score) {
        GamePlayer player = players.get(userName);
        if (player != null && !player.isStunned()) {
            player.addScore(score);
        }
    }

    public void applyStun(String userName, int seconds) {
        GamePlayer player = players.get(userName);
        if (player != null) {
            player.stun(seconds);
        }
    }

    public int getRemainingTime() {
        // 게임 진행 시간: 100초로 고정
        int elapsed = (int) ((System.currentTimeMillis() - startTime) / 1000);
        return Math.max(0, 100 - elapsed);
    }

    public Collection<GamePlayer> getPlayers() {
        return players.values();
    }
}