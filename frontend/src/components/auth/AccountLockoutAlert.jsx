import React, { useState, useEffect } from 'react';
import { FaLock } from 'react-icons/fa';

const AccountLockoutAlert = ({ lockoutTime, onClose }) => {
    const [remainingTime, setRemainingTime] = useState('');
    const LOCKOUT_DURATION_MINUTES = 15;

    useEffect(() => {
        if (!lockoutTime) return;

        const calculateRemainingTime = () => {
            const lockoutEnd = new Date(lockoutTime);
            lockoutEnd.setMinutes(lockoutEnd.getMinutes() + LOCKOUT_DURATION_MINUTES);
            const now = new Date();
            const diff = lockoutEnd - now;

            if (diff <= 0) {
                setRemainingTime('Account is now unlocked. Please try logging in again.');
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setRemainingTime(`${minutes}m ${seconds}s`);
        };

        calculateRemainingTime();
        const interval = setInterval(calculateRemainingTime, 1000);

        return () => clearInterval(interval);
    }, [lockoutTime]);

    if (!lockoutTime) return null;

    return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <FaLock className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                        Account Locked
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                        <p>
                            Your account has been temporarily locked due to multiple failed login attempts.
                            Please try again in {remainingTime}.
                        </p>
                        {remainingTime.includes('unlocked') && (
                            <button
                                onClick={onClose}
                                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                            >
                                Dismiss
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountLockoutAlert; 