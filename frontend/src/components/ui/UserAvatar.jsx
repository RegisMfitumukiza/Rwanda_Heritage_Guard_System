import React from 'react';

const UserAvatar = ({ user, size = 'md', className = '' }) => {
    const getSizeClasses = (size) => {
        switch (size) {
            case 'xs':
                return 'w-6 h-6 text-xs';
            case 'sm':
                return 'w-8 h-8 text-sm';
            case 'md':
                return 'w-10 h-10 text-sm';
            case 'lg':
                return 'w-12 h-12 text-base';
            case 'xl':
                return 'w-16 h-16 text-lg';
            case '2xl':
                return 'w-20 h-20 text-xl';
            default:
                return 'w-10 h-10 text-sm';
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getBackgroundColor = (name) => {
        if (!name) return 'bg-gray-500';

        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-yellow-500',
            'bg-red-500',
            'bg-teal-500'
        ];

        const hash = name.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);

        return colors[Math.abs(hash) % colors.length];
    };

    if (user?.avatarUrl) {
        return (
            <img
                src={user.avatarUrl}
                alt={user.fullName || 'User avatar'}
                className={`${getSizeClasses(size)} ${className} rounded-full object-cover`}
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
            />
        );
    }

    return (
        <div className="relative">
            <img
                src={user?.avatarUrl}
                alt={user?.fullName || 'User avatar'}
                className={`${getSizeClasses(size)} ${className} rounded-full object-cover hidden`}
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
            />
            <div
                className={`${getSizeClasses(size)} ${className} ${getBackgroundColor(user?.fullName)} rounded-full flex items-center justify-center text-white font-semibold hidden`}
            >
                {getInitials(user?.fullName)}
            </div>
        </div>
    );
};

export { UserAvatar }; 