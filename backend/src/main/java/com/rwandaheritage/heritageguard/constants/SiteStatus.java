package com.rwandaheritage.heritageguard.constants;

/**
 * Heritage Site Status Enumeration
 * Defines all valid status values for heritage sites with workflow rules
 */
public enum SiteStatus {
    PROPOSED("Proposed", "Site is proposed for heritage designation", new String[]{"ACTIVE", "INACTIVE", "ARCHIVED"}),
    ACTIVE("Active", "Site is publicly accessible and fully operational", new String[]{"UNDER_CONSERVATION", "PROPOSED", "INACTIVE", "ARCHIVED"}),
    UNDER_CONSERVATION("Under Conservation", "Site is undergoing conservation or restoration work", new String[]{"ACTIVE", "INACTIVE", "ARCHIVED"}),
    INACTIVE("Inactive", "Site is not publicly accessible or temporarily closed", new String[]{"ACTIVE", "UNDER_CONSERVATION", "PROPOSED", "ARCHIVED"}),
    ARCHIVED("Archived", "Site is archived and not publicly visible, but data is preserved", new String[]{"ACTIVE", "INACTIVE", "PROPOSED"});

    private final String label;
    private final String description;
    private final String[] allowedTransitions;

    SiteStatus(String label, String description, String[] allowedTransitions) {
        this.label = label;
        this.description = description;
        this.allowedTransitions = allowedTransitions;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    public String[] getAllowedTransitions() {
        return allowedTransitions;
    }

    /**
     * Check if transition from current status to new status is allowed
     */
    public boolean canTransitionTo(SiteStatus newStatus) {
        for (String allowedStatus : allowedTransitions) {
            if (allowedStatus.equals(newStatus.name())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if a status is publicly visible
     */
    public boolean isPubliclyVisible() {
        return this == ACTIVE || this == UNDER_CONSERVATION;
    }

    /**
     * Check if a status allows public access
     */
    public boolean allowsPublicAccess() {
        return this == ACTIVE;
    }

    /**
     * Get status by string value (case-insensitive)
     */
    public static SiteStatus fromString(String status) {
        if (status == null) return null;
        
        for (SiteStatus siteStatus : values()) {
            if (siteStatus.name().equalsIgnoreCase(status) || 
                siteStatus.label.equalsIgnoreCase(status)) {
                return siteStatus;
            }
        }
        throw new IllegalArgumentException("Invalid site status: " + status);
    }

    /**
     * Check if a status string is valid
     */
    public static boolean isValid(String status) {
        try {
            fromString(status);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    @Override
    public String toString() {
        return label;
    }
}





