import React from 'react';
import { Award, BookOpen } from 'lucide-react';

/**
 * QuizIndicator Component
 * Shows a visual indicator when an article has an associated quiz
 * 
 * @param {Object} props
 * @param {boolean} props.hasQuiz - Whether the article has a quiz
 * @param {string} props.variant - 'badge' | 'button' | 'inline'
 * @param {function} props.onTakeQuiz - Callback when quiz button is clicked
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.showText - Whether to show descriptive text
 */
const QuizIndicator = ({
    hasQuiz,
    variant = 'badge',
    onTakeQuiz,
    size = 'md',
    showText = true
}) => {
    if (!hasQuiz) return null;

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    // Badge variant - compact indicator
    if (variant === 'badge') {
        return (
            <div className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800`}>
                <Award className={iconSizes[size]} />
                {showText && <span>Quiz Available</span>}
            </div>
        );
    }

    // Button variant - clickable quiz button
    if (variant === 'button') {
        return (
            <button
                onClick={onTakeQuiz}
                className={`inline-flex items-center gap-2 ${sizeClasses[size]} bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium`}
            >
                <Award className={iconSizes[size]} />
                {showText && <span>Take Quiz</span>}
            </button>
        );
    }

    // Inline variant - subtle text indicator
    if (variant === 'inline') {
        return (
            <div className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <BookOpen className={iconSizes[size]} />
                {showText && <span className="text-sm">Quiz available</span>}
            </div>
        );
    }

    return null;
};

export default QuizIndicator;
