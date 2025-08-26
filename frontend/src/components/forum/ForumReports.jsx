import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useGet, usePost } from '../../hooks/useSimpleApi';

const ForumReports = () => {
    const [filters, setFilters] = useState({
        status: '',
        contentType: '',
        search: ''
    });
    const [selectedReport, setSelectedReport] = useState(null);

    const { data: reports, loading, refetch } = useGet('/api/forum/reports', {}, {
        onSuccess: (data) => console.log('Forum reports loaded:', data),
        onError: (error) => console.error('Failed to load forum reports:', error)
    });

    const updateReportStatus = usePost('/api/forum/reports/update', {
        onSuccess: (data) => {
            console.log('Report status updated:', data);
            refetch();
        },
        onError: (error) => console.error('Failed to update report status:', error)
    });

    const handleStatusUpdate = async (reportId, newStatus, notes = '') => {
        try {
            await updateReportStatus.execute({
                reportId,
                statusData: { status: newStatus, moderatorNotes: notes }
            });
            refetch();
        } catch (error) {
            console.error('Error updating report status:', error);
        }
    };

    const filteredReports = reports?.content?.filter(report => {
        if (filters.status && report.status !== filters.status) return false;
        if (filters.contentType && report.contentType !== filters.contentType) return false;
        if (filters.search && !report.reason.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
    }) || [];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'REVIEWED': return <AlertTriangle className="w-4 h-4 text-blue-600" />;
            case 'RESOLVED': return <CheckCircle className="w-4 h-4 text-green-600" />;
            default: return <FileText className="w-4 h-4 text-gray-600" />;
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

    const getContentTypeDisplay = (contentType) => {
        return contentType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) {
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
                <FileText className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Content Reports
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({reports?.content?.length || 0} total)
                </span>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search reports..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="REVIEWED">Reviewed</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                    <select
                        value={filters.contentType}
                        onChange={(e) => setFilters({ ...filters, contentType: e.target.value })}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Content Types</option>
                        <option value="FORUM_TOPIC">Forum Topic</option>
                        <option value="FORUM_POST">Forum Post</option>
                    </select>
                </div>
            </Card>

            {/* Reports List */}
            <div className="space-y-4">
                {filteredReports.map((report) => (
                    <Card key={report.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    {getStatusIcon(report.status)}
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {getContentTypeDisplay(report.contentType)}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                        {report.reason}
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
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedReport(report)}
                                >
                                    View Details
                                </Button>

                                {report.status === 'PENDING' && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleStatusUpdate(report.id, 'RESOLVED', 'Content approved')}
                                            className="text-green-600 hover:text-green-700"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleStatusUpdate(report.id, 'REVIEWED', 'Content flagged for review')}
                                            className="text-yellow-600 hover:text-yellow-700"
                                        >
                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                            Flag
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleStatusUpdate(report.id, 'RESOLVED', 'Content rejected')}
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

                {filteredReports.length === 0 && (
                    <div className="text-center py-8">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {filters.status || filters.contentType || filters.search ? 'No reports match your filters' : 'No reports found'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {filters.status || filters.contentType || filters.search
                                ? 'Try adjusting your search criteria'
                                : 'All content is currently compliant with community guidelines'
                            }
                        </p>
                        {(filters.status || filters.contentType || filters.search) && (
                            <Button
                                variant="outline"
                                onClick={() => setFilters({ status: '', contentType: '', search: '' })}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Report Details
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedReport.status)}`}>
                                        {selectedReport.status}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Content Type
                                    </label>
                                    <span className="text-gray-900 dark:text-white">
                                        {getContentTypeDisplay(selectedReport.contentType)}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Reason
                                    </label>
                                    <span className="text-gray-900 dark:text-white">
                                        {selectedReport.reason}
                                    </span>
                                </div>

                                {selectedReport.description && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Description
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedReport.description}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Reported By
                                    </label>
                                    <span className="text-gray-900 dark:text-white">
                                        {selectedReport.reportedBy}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Report Date
                                    </label>
                                    <span className="text-gray-900 dark:text-white">
                                        {new Date(selectedReport.reportedDate).toLocaleDateString()}
                                    </span>
                                </div>

                                {selectedReport.reviewedBy && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Reviewed By
                                        </label>
                                        <span className="text-gray-900 dark:text-white">
                                            {selectedReport.reviewedBy}
                                        </span>
                                    </div>
                                )}

                                {selectedReport.moderatorNotes && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Moderator Notes
                                        </label>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedReport.moderatorNotes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForumReports;


