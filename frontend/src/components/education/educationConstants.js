// Education-related constants shared across components

export const categories = [
    'HERITAGE_SITES', 'TRADITIONAL_CRAFTS', 'CULTURAL_PRACTICES',
    'HISTORICAL_EVENTS', 'ROYAL_HISTORY', 'TRADITIONAL_MUSIC',
    'ARCHITECTURE', 'CUSTOMS_TRADITIONS', 'GENERAL_EDUCATION'
];

export const difficultyLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export const questionTypes = [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
    { value: 'TRUE_FALSE', label: 'True/False' },
    { value: 'FILL_IN_BLANK', label: 'Fill in the Blank' }
];

// Helper functions to convert enum values to user-friendly names
export const getCategoryDisplayName = (category) => {
    const displayNames = {
        'HERITAGE_SITES': 'Heritage Sites',
        'TRADITIONAL_CRAFTS': 'Traditional Crafts',
        'CULTURAL_PRACTICES': 'Cultural Practices',
        'HISTORICAL_EVENTS': 'Historical Events',
        'ROYAL_HISTORY': 'Royal History',
        'TRADITIONAL_MUSIC': 'Traditional Music',
        'ARCHITECTURE': 'Architecture',
        'CUSTOMS_TRADITIONS': 'Customs & Traditions',
        'GENERAL_EDUCATION': 'General Education'
    };
    return displayNames[category] || category;
};

export const getDifficultyDisplayName = (difficulty) => {
    const displayNames = {
        'BEGINNER': 'Beginner',
        'INTERMEDIATE': 'Intermediate',
        'ADVANCED': 'Advanced'
    };
    return displayNames[difficulty] || difficulty;
};
