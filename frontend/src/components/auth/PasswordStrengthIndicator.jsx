import React from 'react';

const requirements = [
    {
        label: 'At least 8 characters',
        test: (pw) => pw.length >= 8,
    },
    {
        label: 'Contains uppercase letter',
        test: (pw) => /[A-Z]/.test(pw),
    },
    {
        label: 'Contains lowercase letter',
        test: (pw) => /[a-z]/.test(pw),
    },
    {
        label: 'Contains number',
        test: (pw) => /[0-9]/.test(pw),
    },
    {
        label: 'Contains special character',
        test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    },
];

const getStrength = (score) => {
    if (score >= 5) return { label: 'Very Strong', color: 'bg-blue-600' };
    if (score === 4) return { label: 'Strong', color: 'bg-blue-400' };
    if (score === 3) return { label: 'Medium', color: 'bg-yellow-400' };
    if (score === 2) return { label: 'Weak', color: 'bg-orange-400' };
    return { label: 'Very Weak', color: 'bg-red-500' };
};

const PasswordStrengthIndicator = ({ password }) => {
    const passed = requirements.map((req) => req.test(password));
    const score = passed.filter(Boolean).length;
    const { label, color } = getStrength(score);

    return (
        <div className="mt-2">
            {/* Strength Bar */}
            <div className="w-full h-2 bg-gray-200 rounded">
                <div
                    className={`h-2 rounded transition-all duration-300 ${color}`}
                    style={{ width: `${(score / requirements.length) * 100}%` }}
                ></div>
            </div>
            {/* Strength Label */}
            <div className="flex items-center mt-1">
                <span className={`text-xs font-semibold ${score >= 4 ? 'text-blue-700' : score === 3 ? 'text-yellow-700' : 'text-red-600'
                    }`}>
                    {label}
                </span>
            </div>
            {/* Live Checklist */}
            <ul className="mt-2 space-y-1 text-xs">
                {requirements.map((req, idx) => (
                    <li key={req.label} className="flex items-center gap-2">
                        <span
                            className={`inline-block w-4 h-4 rounded-full border-2 ${passed[idx] ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                                } flex items-center justify-center`}
                        >
                            {passed[idx] && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            )}
                        </span>
                        <span className={passed[idx] ? 'text-blue-700' : 'text-gray-500'}>{req.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PasswordStrengthIndicator; 