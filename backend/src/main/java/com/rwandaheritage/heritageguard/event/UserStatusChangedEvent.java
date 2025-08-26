package com.rwandaheritage.heritageguard.event;

import com.rwandaheritage.heritageguard.model.UserStatus;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event fired when a user's status changes
 */
@Getter
public class UserStatusChangedEvent extends ApplicationEvent {
    
    private final Long userId;
    private final UserStatus oldStatus;
    private final UserStatus newStatus;
    private final String changedBy;
    
    public UserStatusChangedEvent(Object source, Long userId, UserStatus oldStatus, UserStatus newStatus, String changedBy) {
        super(source);
        this.userId = userId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
    }
}
