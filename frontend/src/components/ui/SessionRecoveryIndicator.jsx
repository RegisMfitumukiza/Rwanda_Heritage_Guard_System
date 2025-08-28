import React, { useState, useEffect } from 'react';
import sessionRecovery from '../../utils/sessionRecovery';

const SessionRecoveryIndicator = () => {
    const [isRecovering, setIsRecovering] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const checkRecoveryStatus = () => {
            setIsRecovering(sessionRecovery.isRecovering);
            setRetryCount(sessionRecovery.retryAttempts);
        };

        // Check status every second
        const interval = setInterval(checkRecoveryStatus, 1000);
        checkRecoveryStatus(); // Check immediately

        return () => clearInterval(interval);
    }, []);

    if (!isRecovering) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
            <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                <div>
                    <h4 className="text-sm font-medium text-blue-900">
                        Restoring Session...
                    </h4>
                    <p className="text-xs text-blue-700">
                        Attempt {retryCount} of {sessionRecovery.maxRetries}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SessionRecoveryIndicator;
