package com.rwandaheritage.heritageguard.model;

// Ownership type enum for simplified management
public enum OwnershipType {
    PUBLIC("Public"),
    PRIVATE("Private"),
    COMMUNITY("Community"),
    GOVERNMENT("Government"),
    MIXED("Mixed"),
    UNKNOWN("Unknown");
    
    private final String displayName;
    
    OwnershipType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}




