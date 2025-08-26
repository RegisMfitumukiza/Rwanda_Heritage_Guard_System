package com.rwandaheritage.heritageguard.model;

/**
 * User status enum for better status management
 */
public enum UserStatus {
    ACTIVE,         // Normal user with full access
    SUSPENDED,      // Temporary suspension (can be reactivated)
    DISABLED,       // Permanent deactivation (cannot be reactivated)
    DELETED         // Marked as deleted but data preserved (soft delete)
}
