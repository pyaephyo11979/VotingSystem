package org.example.shared;

import java.io.Serializable;

public class EventInfo implements Serializable {
    private String eventId;
    private String eventName;
    private String eventPassword;

    public EventInfo(String eventId, String eventName, String eventPassword) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.eventPassword = eventPassword;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getEventPassword() {
        return eventPassword;
    }

    public void setEventPassword(String eventPassword) {
        this.eventPassword = eventPassword;
    }
}