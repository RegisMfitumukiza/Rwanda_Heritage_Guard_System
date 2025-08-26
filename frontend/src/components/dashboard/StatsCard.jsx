import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, StatsCardSkeleton } from '../ui';

const StatsCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    color = 'blue',
    loading = false,
    onClick,
    className = '',
    ...props
}) => {
    // Color variants for different stat types
    const colorVariants = {
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            icon: 'text-blue-600 dark:text-blue-400',
            accent: 'bg-blue-500',
        },
        green: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            icon: 'text-green-600 dark:text-green-400',
            accent: 'bg-green-500',
        },
        yellow: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            icon: 'text-yellow-600 dark:text-yellow-400',
            accent: 'bg-yellow-500',
        },
        red: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            icon: 'text-red-600 dark:text-red-400',
            accent: 'bg-red-500',
        },
        purple: {
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            icon: 'text-purple-600 dark:text-purple-400',
            accent: 'bg-purple-500',
        },
        gray: {
            bg: 'bg-gray-50 dark:bg-gray-900/20',
            icon: 'text-gray-600 dark:text-gray-400',
            accent: 'bg-gray-500',
        },
    };

    const colors = colorVariants[color] || colorVariants.blue;

    // Trend icon and color
    const getTrendDisplay = () => {
        if (!trend || !trendValue) return null;

        let TrendIcon = Minus;
        let trendColor = 'text-gray-500';

        if (trend === 'up') {
            TrendIcon = TrendingUp;
            trendColor = 'text-green-500';
        } else if (trend === 'down') {
            TrendIcon = TrendingDown;
            trendColor = 'text-red-500';
        }

        return (
            <div className={`flex items-center space-x-1 ${trendColor}`}>
                <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">{trendValue}</span>
            </div>
        );
    };

    // Loading skeleton
    if (loading) {
        return <StatsCardSkeleton className={className} {...props} />;
    }

    return (
        <div className={onClick ? 'cursor-pointer' : ''}>
            <Card
                className={`${className} transition-all duration-200 hover:shadow-md border-l-4 ${colors.accent} h-full`}
                onClick={onClick}
                {...props}
            >
                <CardContent className="p-4 sm:p-5 lg:p-6">
                    <div className="flex items-center justify-between h-full">
                        <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                            {/* Title */}
                            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide leading-tight">
                                {title}
                            </p>

                            {/* Value */}
                            <div className="flex items-baseline space-x-2">
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {value}
                                </p>
                                {getTrendDisplay()}
                            </div>

                            {/* Subtitle */}
                            {subtitle && (
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-tight">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {/* Icon */}
                        {Icon && (
                            <div className={`p-2.5 sm:p-3 lg:p-4 rounded-lg ${colors.bg} flex-shrink-0 ml-3`}>
                                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.icon}`} />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Preset stat card variants for common use cases
export const SiteStatsCard = ({ count, subtitle, ...props }) => (
    <StatsCard
        title="Heritage Sites"
        value={count || 0}
        color="green"
        subtitle={subtitle || "Total documented sites"}
        {...props}
    />
);

export const DocumentStatsCard = ({ count, subtitle, ...props }) => (
    <StatsCard
        title="Documents"
        value={count || 0}
        color="blue"
        subtitle={subtitle || "Archived documents"}
        {...props}
    />
);

export const UserStatsCard = ({ count, ...props }) => (
    <StatsCard
        title="Community Members"
        value={count || 0}
        color="purple"
        subtitle="Active users"
        {...props}
    />
);

export const ArtifactStatsCard = ({ count, subtitle, ...props }) => (
    <StatsCard
        title="Artifacts"
        value={count || 0}
        color="yellow"
        subtitle={subtitle || "Authenticated artifacts"}
        {...props}
    />
);

export default StatsCard;



