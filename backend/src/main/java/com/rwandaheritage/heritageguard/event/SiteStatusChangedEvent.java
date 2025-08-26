package com.rwandaheritage.heritageguard.event;

import org.springframework.context.ApplicationEvent;

/**
 * Event fired when a heritage site's status changes
 * This enables real-time updates across the system
 */
public class SiteStatusChangedEvent extends ApplicationEvent {
    
    private final Long siteId;
    private final String oldStatus;
    private final String newStatus;
    private final String reason;
    private final String changedBy;
    
    public SiteStatusChangedEvent(Object source, Long siteId, String oldStatus, String newStatus, String reason, String changedBy) {
        super(source);
        this.siteId = siteId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.reason = reason;
        this.changedBy = changedBy;
    }
    
    public Long getSiteId() {
        return siteId;
    }
    
    public String getOldStatus() {
        return oldStatus;
    }
    
    public String getNewStatus() {
        return newStatus;
    }
    
    public String getReason() {
        return reason;
    }
    
    public String getChangedBy() {
        return changedBy;
    }
}
