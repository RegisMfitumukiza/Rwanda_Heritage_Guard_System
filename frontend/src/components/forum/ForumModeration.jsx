import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Shield, Flag } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGet, usePost } from '../../hooks/useSimpleApi';

const ForumModeration = () => {
    const [selectedReports, setSelectedReports] = useState([]);
    const [moderationAction, setModerationAction] = useState('');
    const [moderationReason, setModerationReason] = useState('');

    const { data: topics, loading: topicsLoading } = useGet('/api/forum/topics', {}, {
        onSuccess: (data) => console.log('Forum topics loaded:', data),
        onError: (error) => console.error('Failed to load forum topics:', error)
    });

    const { data: posts, loading: postsLoading } = useGet('/api/forum/posts', {}, {
        onSuccess: (data) => console.log('Forum posts loaded:', data),
        onError: (error) => console.error('Failed to load forum posts:', error)
    });

    const { data: reports, loading: reportsLoading, refetch: refetchReports } = useGet('/api/forum/reports', {}, {
        onSuccess: (data) => console.log('Forum reports loaded:', data),
        onError: (error) => console.error('Failed to load forum reports:', error)
    });

    const updateReportStatus = usePost('/api/forum/reports/update', {
        onSuccess: (data) => {
            console.log('Report status updated:', data);
            refetchReports();
        },
        onError: (error) => console.error('Failed to update report status:', error)
    });

    const bulkModerate = usePost('/api/forum/reports/bulk-moderate', {
        onSuccess: (data) => {
            console.log('Bulk moderation completed:', data);
            setSelectedReports([]);
            setModerationAction('');
            setModerationReason('');
            refetchReports();
        },
        onError: (error) => console.error('Failed to perform bulk moderation:', error)
    });

    const handleReportAction = async (reportId, action, notes = '') => {
        try {
            await updateReportStatus.execute({
                reportId,
                statusData: { status: action, moderatorNotes: notes }
            });
        } catch (error) {
            console.error('Error updating report status:', error);
        }
    };

    const handleBulkModeration = async () => {
        if (selectedReports.length === 0 || !moderationAction) return;

        try {
            await bulkModerate.execute({
                action: moderationAction,
                contentIds: selectedReports.map(r => r.contentId),
                contentType: 'FORUM_POST',
                reason: moderationReason
            });
        } catch (error) {
            console.error('Error performing bulk moderation:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'REVIEWED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'RESOLVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getContentTypeIcon = (contentType) => {
        switch (contentType) {
            case 'FORUM_TOPIC': return <Eye className="w-4 h-4" />;
            case 'FORUM_POST': return <Flag className="w-4 h-4" />;
            default: return <AlertTriangle className="w-4 h-4" />;
        }
    };

    if (reportsLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Content Moderation
                </h2>
            </div>

            {/* Bulk Moderation */}
            {selectedReports.length > 0 && (
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                {selectedReports.length} reports selected
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <select
                                value={moderationAction}
                                onChange={(e) => setModerationAction(e.target.value)}
                                className="p-2 border border-blue-300 rounded-lg text-sm"
                            >
                                <option value="">Select action</option>
                                <option value="APPROVED">Approve</option>
                                <option value="REJECTED">Reject</option>
                                <option value="FLAGGED">Flag for review</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Reason (optional)"
                                value={moderationReason}
                                onChange={(e) => setModerationReason(e.target.value)}
                                className="p-2 border border-blue-300 rounded-lg text-sm w-48"
                            />
                            <Button
                                onClick={handleBulkModeration}
                                disabled={!moderationAction || bulkModerate.loading}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {bulkModerate.loading ? 'Processing...' : 'Apply Action'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReports([])}
                            >
                                Clear Selection
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Reports List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Content Reports ({reports?.content?.length || 0})
                </h3>

                {reports?.content?.map((report) => (
                    <Card key={report.id} className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    {getContentTypeIcon(report.contentType)}
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {report.contentType.replace('_', ' ')}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                        Report Reason: {report.reason}
                                    </h4>
                                    {report.description && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {report.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span>Reported by {report.reportedBy}</span>
                                    <span>{new Date(report.reportedDate).toLocaleDateString()}</span>
                                    {report.reviewedBy && (
                                        <span>Reviewed by {report.reviewedBy}</span>
                                    )}
                                </div>

                                {report.moderatorNotes && (
                                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                                        <span className="font-medium">Moderator Notes:</span> {report.moderatorNotes}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                                <input
                                    type="checkbox"
                                    checked={selectedReports.some(r => r.id === report.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedReports([...selectedReports, report]);
                                        } else {
                                            setSelectedReports(selectedReports.filter(r => r.id !== report.id));
                                        }
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />

                                {report.status === 'PENDING' && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReportAction(report.id, 'RESOLVED', 'Content approved')}
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReportAction(report.id, 'REVIEWED', 'Content flagged for review')}
                                            className="text-yellow-600 hover:text-yellow-700"
                                        >
                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                            Flag
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleReportAction(report.id, 'RESOLVED', 'Content rejected')}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}

                {reports?.content?.length === 0 && (
                    <div className="text-center py-8">
                        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No reports to review
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            All content is currently compliant with community guidelines
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForumModeration;


