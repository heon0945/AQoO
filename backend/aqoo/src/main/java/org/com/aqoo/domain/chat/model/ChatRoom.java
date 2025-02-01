package org.com.aqoo.domain.chat.model;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Setter
public class ChatRoom {
    private String id;
    private String name;
    private Set<String> members = ConcurrentHashMap.newKeySet();

    public ChatRoom(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public void addMember(String username) {
        members.add(username);
    }

    public void removeMember(String username) {
        members.remove(username);
    }
}
