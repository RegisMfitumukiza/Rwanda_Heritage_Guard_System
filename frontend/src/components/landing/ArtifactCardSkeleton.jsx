import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

const ArtifactCardSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="animate-pulse"
        >
            <Card className="overflow-hidden h-full">
                {/* Image skeleton */}
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>

                    {/* Category badge skeleton */}
                    <div className="absolute top-3 left-3">
                        <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    </div>

                    {/* Authentication status skeleton */}
                    <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    </div>
                </div>

                {/* Content skeleton */}
                <div className="p-4 space-y-3">
                    {/* Title skeleton */}
                    <div className="space-y-2">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>

                    {/* Description skeleton */}
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
                    </div>

                    {/* Heritage site skeleton */}
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>

                    {/* Stats skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default ArtifactCardSkeleton;

