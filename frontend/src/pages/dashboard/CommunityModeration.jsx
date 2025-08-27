import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui';
import { AlertTriangle, CheckCircle, XCircle, Shield, RefreshCw, Eye, Ban, Flag, MessageSquare, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { communityApi } from '../../services/api/communityApi';

const CommunityModeration = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(false);
    const [pendingContent, setPendingContent] = useState([]);
    const [reportedContent, setReportedContent] = useState([]);

    if (!user || !['CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR'].includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-semibold mb-2">{t('Access Denied')}</h2>
                        <p className="text-gray-600">{t('You do not have permission to access this page.')}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Fetch pending content for review
    const fetchPendingContent = async () => {
        setLoading(true);
        try {
            const reports = await communityApi.getReports('unresolved');
            setPendingContent(reports.data || []);
        } catch (error) {
            console.error('Failed to fetch pending content:', error);
            toast.error('Failed to load pending content');
        } finally {
            setLoading(false);
        }
    };

    // Fetch reported content
    const fetchReportedContent = async () => {
        setLoading(true);
        try {
            const reports = await communityApi.getReports();
            setReportedContent(reports.data || []);
        } catch (error) {
            console.error('Failed to fetch reported content:', error);
            toast.error('Failed to load reported content');
        } finally {
            setLoading(false);
        }
    };

    // Handle content review action
    const handleContentAction = async (contentId, contentType, action, notes = '') => {
        try {
            await communityApi.updateReportStatus(contentId, 'resolved', action, notes);
            toast.success(`Content ${action.toLowerCase()} successfully`);

            // Refresh data
            if (activeTab === 'pending') {
                fetchPendingContent();
            } else {
                fetchReportedContent();
            }
        } catch (error) {
            console.error('Failed to update content status:', error);
            toast.error('Failed to update content status');
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchPendingContent();
        fetchReportedContent();
    }, []);

    // Refresh data
    const handleRefresh = () => {
        if (activeTab === 'pending') {
            fetchPendingContent();
        } else {
            fetchReportedContent();
        }
    };

    // Get content preview
    const getContentPreview = (content) => {
        if (content.contentType === 'TOPIC') {
            return content.title || 'Topic Title';
        } else if (content.contentType === 'POST') {
            return content.content || 'Post Content';
        }
        return 'Content Preview';
    };

    // Get report reason display
    const getReportReasonDisplay = (reason) => {
        const reasons = {
            'SPAM': { label: 'Spam', color: 'red' },
            'INAPPROPRIATE': { label: 'Inappropriate', color: 'orange' },
            'OFF_TOPIC': { label: 'Off Topic', color: 'yellow' },
            'HARASSMENT': { label: 'Harassment', color: 'red' },
            'MISLEADING': { label: 'Misleading', color: 'orange' },
            'OTHER': { label: 'Other', color: 'gray' }
        };
        return reasons[reason] || { label: reason, color: 'gray' };
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('Community Moderation')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('Manage and moderate community content')}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {t('Refresh')}
                    </Button>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pending">
                        {t('Pending Review')}
                        <Badge variant="secondary" className="ml-2">{pendingContent.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="reported">
                        {t('Reported Content')}
                        <Badge variant="secondary" className="ml-2">{reportedContent.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('Content Pending Review')}</h3>
                    </div>

                    {loading ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
                                <p className="text-gray-600">{t('Loading pending content...')}</p>
                            </CardContent>
                        </Card>
                    ) : pendingContent.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                <p className="text-gray-600">{t('No content pending review')}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {pendingContent.map((content) => (
                                <Card key={content.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {content.contentType === 'TOPIC' ? (
                                                    <FileText className="w-5 h-5 text-blue-500" />
                                                ) : (
                                                    <MessageSquare className="w-5 h-5 text-green-500" />
                                                )}
                                                <CardTitle className="text-lg">
                                                    {getContentPreview(content)}
                                                </CardTitle>
                                            </div>
                                            <Badge variant="outline">
                                                {content.contentType}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">Reported for:</span>
                                                {(() => {
                                                    const reason = getReportReasonDisplay(content.reportReason);
                                                    return (
                                                        <Badge variant="outline" className={`text-${reason.color}-600 border-${reason.color}-300`}>
                                                            {reason.label}
                                                        </Badge>
                                                    );
                                                })()}
                                            </div>

                                            {content.description && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Details:</strong> {content.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>Reported by: {content.reporterId}</span>
                                                <span>•</span>
                                                <span>{new Date(content.reportedAt).toLocaleDateString()}</span>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleContentAction(content.id, content.contentType, 'FLAG')}
                                                >
                                                    <Flag className="w-4 h-4 mr-1" />
                                                    Flag
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleContentAction(content.id, content.contentType, 'DELETE')}
                                                >
                                                    <Ban className="w-4 h-4 mr-1" />
                                                    Delete
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleContentAction(content.id, content.contentType, 'IGNORE')}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Ignore
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="reported" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('Reported Content')}</h3>
                    </div>

                    {loading ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
                                <p className="text-gray-600">{t('Loading reported content...')}</p>
                            </CardContent>
                        </Card>
                    ) : reportedContent.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                <p className="text-gray-600">{t('No reported content')}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {reportedContent.map((content) => (
                                <Card key={content.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {content.contentType === 'TOPIC' ? (
                                                    <FileText className="w-5 h-5 text-blue-500" />
                                                ) : (
                                                    <MessageSquare className="w-5 h-5 text-green-500" />
                                                )}
                                                <CardTitle className="text-lg">
                                                    {getContentPreview(content)}
                                                </CardTitle>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {content.contentType}
                                                </Badge>
                                                <Badge variant={content.isResolved ? "default" : "secondary"}>
                                                    {content.isResolved ? 'Resolved' : 'Pending'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">Reported for:</span>
                                                {(() => {
                                                    const reason = getReportReasonDisplay(content.reportReason);
                                                    return (
                                                        <Badge variant="outline" className={`text-${reason.color}-600 border-${reason.color}-300`}>
                                                            {reason.label}
                                                        </Badge>
                                                    );
                                                })()}
                                            </div>

                                            {content.description && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Details:</strong> {content.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>Reported by: {content.reporterId}</span>
                                                <span>•</span>
                                                <span>{new Date(content.reportedAt).toLocaleDateString()}</span>
                                            </div>

                                            {content.isResolved && (
                                                <div className="pt-2 border-t border-gray-200">
                                                    <p className="text-sm text-gray-600">
                                                        <strong>Resolution:</strong> {content.resolutionAction} - {content.resolutionNotes}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Resolved by: {content.resolvedBy} on {new Date(content.resolvedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CommunityModeration;
