package org.example.shared;

import java.io.Serializable;

public class User implements Serializable {
    private String userId;
    private String password;
    private String eventID;

    public User(String userId, String password, String eventID) {
        this.userId = userId;
        this.password = password;
        this.eventID = eventID;
    }

    public String getUserId() {
        return this.userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEventID() {
        return this.eventID;
    }

    public void setEventID(String eventID) {
        this.eventID = eventID;
    }
}
