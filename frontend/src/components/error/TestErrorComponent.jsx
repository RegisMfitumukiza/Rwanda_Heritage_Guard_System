import React from 'react';

const TestErrorComponent = ({ shouldThrow = false }) => {
    if (shouldThrow) {
        throw new Error('This is a test error to verify error boundaries are working!');
    }

    return (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-700 dark:text-green-300">
                ✅ Error boundary test component loaded successfully!
            </p>
        </div>
    );
};

export default TestErrorComponent;


