import React from 'react';
import { motion } from 'framer-motion';
import { Archive, MapPin, Shield, Calendar, Image } from 'lucide-react';
import { Card } from '../ui/Card';

const ArtifactCard = ({ artifact, index, onCardClick }) => {
    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Recently added';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Recently added';
        }
    };

    // Helper function to get primary image
    const getPrimaryImage = () => {
        if (artifact.media && artifact.media.length > 0) {
            // Find first public image
            const publicImage = artifact.media.find(media => media.isPublic);
            return publicImage || artifact.media[0];
        }
        return null;
    };

    // Helper function to check if artifact is authenticated
    const isAuthenticated = () => {
        return artifact.authentications &&
            artifact.authentications.some(auth => auth.status === 'AUTHENTICATED');
    };

    const primaryImage = getPrimaryImage();
    const authenticated = isAuthenticated();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{
                scale: 1.02,
                y: -5,
                transition: { duration: 0.2 }
            }}
            className="group cursor-pointer"
            onClick={onCardClick}
        >
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                {/* Artifact Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {primaryImage ? (
                        <img
                            src={primaryImage.filePath}
                            alt={artifact.name?.en || 'Artifact'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}

                    {/* Fallback icon when no image */}
                    <div className={`w-full h-full flex items-center justify-center ${primaryImage ? 'hidden' : ''}`}>
                        <Archive className="w-16 h-16 text-gray-400" />
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {artifact.category || 'Uncategorized'}
                        </span>
                    </div>

                    {/* Authentication Status */}
                    {authenticated && (
                        <div className="absolute top-3 right-3">
                            <div className="bg-green-500 text-white p-1 rounded-full">
                                <Shield className="w-4 h-4" />
                            </div>
                        </div>
                    )}

                    {/* Media Count Badge */}
                    {artifact.media && artifact.media.length > 0 && (
                        <div className="absolute bottom-3 right-3">
                            <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                {artifact.media.length}
                            </div>
                        </div>
                    )}
                </div>

                {/* Artifact Info */}
                <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2 line-clamp-2">
                        {artifact.name?.en || 'Untitled Artifact'}
                    </h4>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 flex-1">
                        {artifact.description?.en || 'No description available'}
                    </p>

                    {/* Heritage Site Info */}
                    {artifact.heritageSite && (
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                                {artifact.heritageSite.nameEn ||
                                    artifact.heritageSite.nameRw ||
                                    artifact.heritageSite.nameFr ||
                                    'Unknown Site'}
                            </span>
                        </div>
                    )}

                    {/* Quick Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(artifact.createdDate)}</span>
                        </div>
                        <span className="text-blue-600 font-medium">
                            {authenticated ? 'Authenticated' : 'Pending'}
                        </span>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default ArtifactCard;
