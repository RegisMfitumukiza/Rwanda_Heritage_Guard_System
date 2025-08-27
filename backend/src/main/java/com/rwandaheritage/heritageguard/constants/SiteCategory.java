package com.rwandaheritage.heritageguard.constants;

/**
 * Heritage Site Category Enumeration
 * Defines all valid category values for heritage sites based on UNESCO classifications
 */
public enum SiteCategory {
    CULTURAL("Cultural", "Sites of cultural heritage significance including monuments, buildings, and archaeological sites"),
    NATURAL("Natural", "Sites of natural heritage significance including national parks and natural landmarks"),
    MIXED("Mixed", "Sites with both cultural and natural heritage significance"),
    ARCHAEOLOGICAL("Archaeological", "Archaeological sites and ancient ruins"),
    ARCHITECTURAL("Architectural", "Buildings and architectural monuments"),
    HISTORICAL("Historical", "Sites of historical significance"),
    RELIGIOUS("Religious", "Religious buildings and sacred sites"),
    MUSEUM("Museum", "Museums and cultural institutions"),
    MEMORIAL("Memorial", "Memorial sites and monuments"),
    TRADITIONAL("Traditional", "Traditional cultural sites and practices");

    private final String label;
    private final String description;

    SiteCategory(String label, String description) {
        this.label = label;
        this.description = description;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Get category by string value (case-insensitive)
     */
    public static SiteCategory fromString(String category) {
        if (category == null) return null;
        
        for (SiteCategory siteCategory : values()) {
            if (siteCategory.name().equalsIgnoreCase(category) || 
                siteCategory.label.equalsIgnoreCase(category)) {
                return siteCategory;
            }
        }
        throw new IllegalArgumentException("Invalid site category: " + category);
    }

    /**
     * Check if a category string is valid
     */
    public static boolean isValid(String category) {
        try {
            fromString(category);
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





