import { useState, useCallback } from 'react';

export const useAuthenticatedMedia = () => {
    const [loading, setLoading] = useState(false);

    const getMediaUrl = useCallback(async (artifactId, mediaId, type = 'preview') => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`/api/artifacts/${artifactId}/media/${mediaId}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            } else {
                throw new Error(`Failed to fetch media: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Media fetch error:', error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const downloadMedia = useCallback(async (artifactId, mediaId, filename) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`/api/artifacts/${artifactId}/media/${mediaId}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = filename || 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);
                return true;
            } else {
                throw new Error(`Download failed: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Download error:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        getMediaUrl,
        downloadMedia,
        loading
    };
};







