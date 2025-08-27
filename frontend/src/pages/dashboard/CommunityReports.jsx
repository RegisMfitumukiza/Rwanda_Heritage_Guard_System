import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui';
import { AlertTriangle, CheckCircle, XCircle, Shield, RefreshCw, Search, Filter, Flag, User, MessageSquare, Ban, Eye, Calendar, Clock, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { communityApi } from '../../services/api/communityApi';

const CommunityReports = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('reports');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [loading, setLoading] = useState(false);

    // Data states
    const [reports, setReports] = useState([]);
    const [violations, setViolations] = useState([]);
    const [usersWithViolations, setUsersWithViolations] = useState([]);
    const [statistics, setStatistics] = useState({
        totalReports: 0,
        pendingReview: 0,
        resolved: 0,
        violations: 0
    });

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

    // Fetch all data
    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch reports
            const reportsData = await communityApi.getReports();
            setReports(reportsData.data || []);

            // Fetch violations (resolved reports with actions)
            const violationsData = reportsData.data?.filter(report =>
                report.isResolved && ['DELETE', 'FLAG'].includes(report.resolutionAction)
            ) || [];
            setViolations(violationsData);

            // Fetch users with violations
            const usersData = await communityApi.getUsersWithViolations();
            setUsersWithViolations(usersData.data || []);

            // Calculate statistics
            const totalReports = reportsData.data?.length || 0;
            const pendingReview = reportsData.data?.filter(r => !r.isResolved).length || 0;
            const resolved = reportsData.data?.filter(r => r.isResolved).length || 0;

            setStatistics({
                totalReports,
                pendingReview,
                resolved,
                violations: violationsData.length
            });

        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load community data');
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchAllData();
    }, []);

    // Refresh data
    const handleRefresh = () => {
        fetchAllData();
    };

    // Filter reports based on search and filters
    const getFilteredReports = () => {
        let filtered = reports;

        if (searchTerm) {
            filtered = filtered.filter(report =>
                report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.reporterId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'ALL') {
            if (statusFilter === 'PENDING') {
                filtered = filtered.filter(report => !report.isResolved);
            } else if (statusFilter === 'RESOLVED') {
                filtered = filtered.filter(report => report.isResolved);
            }
        }

        if (typeFilter !== 'ALL') {
            filtered = filtered.filter(report => report.contentType === typeFilter);
        }

        return filtered;
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

    // Get content type icon
    const getContentTypeIcon = (contentType) => {
        return contentType === 'TOPIC' ? <FileText className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />;
    };

    // Get violation severity
    const getViolationSeverity = (action) => {
        if (action === 'DELETE') return { label: 'High', color: 'red' };
        if (action === 'FLAG') return { label: 'Medium', color: 'orange' };
        return { label: 'Low', color: 'yellow' };
    };

    const filteredReports = getFilteredReports();

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('Community Reports')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('Manage community reports and violations')}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {t('Refresh')}
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{t('Total Reports')}</p>
                                <p className="text-2xl font-bold">{statistics.totalReports}</p>
                            </div>
                            <Flag className="w-8 h-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{t('Pending Review')}</p>
                                <p className="text-2xl font-bold">{statistics.pendingReview}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{t('Resolved')}</p>
                                <p className="text-2xl font-bold">{statistics.resolved}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{t('Violations')}</p>
                                <p className="text-2xl font-bold">{statistics.violations}</p>
                            </div>
                            <Ban className="w-8 h-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder={t('Search reports...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder={t('Status')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t('All Statuses')}</SelectItem>
                                <SelectItem value="PENDING">{t('Pending')}</SelectItem>
                                <SelectItem value="RESOLVED">{t('Resolved')}</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder={t('Report Type')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">{t('All Types')}</SelectItem>
                                <SelectItem value="TOPIC">{t('Topics')}</SelectItem>
                                <SelectItem value="POST">{t('Posts')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="reports">
                        {t('Reports')}
                        <Badge variant="secondary" className="ml-2">{filteredReports.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="violations">
                        {t('Violations')}
                        <Badge variant="secondary" className="ml-2">{violations.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="users">
                        {t('User Management')}
                        <Badge variant="secondary" className="ml-2">{usersWithViolations.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="reports" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('Community Reports')}</h3>
                    </div>

                    {loading ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
                                <p className="text-gray-600">{t('Loading reports...')}</p>
                            </CardContent>
                        </Card>
                    ) : filteredReports.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Flag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600">{t('No reports found')}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredReports.map((report) => (
                                <Card key={report.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getContentTypeIcon(report.contentType)}
                                                <CardTitle className="text-lg">
                                                    Report #{report.id}
                                                </CardTitle>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {report.contentType}
                                                </Badge>
                                                <Badge variant={report.isResolved ? "default" : "secondary"}>
                                                    {report.isResolved ? 'Resolved' : 'Pending'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">Reported for:</span>
                                                {(() => {
                                                    const reason = getReportReasonDisplay(report.reportReason);
                                                    return (
                                                        <Badge variant="outline" className={`text-${reason.color}-600 border-${reason.color}-300`}>
                                                            {reason.label}
                                                        </Badge>
                                                    );
                                                })()}
                                            </div>

                                            {report.description && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Details:</strong> {report.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    <span>{report.reporterId}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(report.reportedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {report.isResolved && (
                                                <div className="pt-2 border-t border-gray-200">
                                                    <p className="text-sm text-gray-600">
                                                        <strong>Resolution:</strong> {report.resolutionAction} - {report.resolutionNotes}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Resolved by: {report.resolvedBy} on {new Date(report.resolvedAt).toLocaleDateString()}
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

                <TabsContent value="violations" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('Community Violations')}</h3>
                    </div>

                    {loading ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
                                <p className="text-gray-600">{t('Loading violations...')}</p>
                            </CardContent>
                        </Card>
                    ) : violations.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Ban className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600">{t('No violations found')}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {violations.map((violation) => (
                                <Card key={violation.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getContentTypeIcon(violation.contentType)}
                                                <CardTitle className="text-lg">
                                                    Violation #{violation.id}
                                                </CardTitle>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {violation.contentType}
                                                </Badge>
                                                {(() => {
                                                    const severity = getViolationSeverity(violation.resolutionAction);
                                                    return (
                                                        <Badge variant="outline" className={`text-${severity.color}-600 border-${severity.color}-300`}>
                                                            {severity.label}
                                                        </Badge>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">Violation type:</span>
                                                <Badge variant="outline" className="text-red-600 border-red-300">
                                                    {violation.resolutionAction}
                                                </Badge>
                                            </div>

                                            {violation.description && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Original Report:</strong> {violation.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    <span>Reported by: {violation.reporterId}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Resolved: {new Date(violation.resolvedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-gray-200">
                                                <p className="text-sm text-gray-600">
                                                    <strong>Resolution Notes:</strong> {violation.resolutionNotes}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Moderator: {violation.resolvedBy}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('User Management')}</h3>
                    </div>

                    {loading ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
                                <p className="text-gray-600">{t('Loading user data...')}</p>
                            </CardContent>
                        </Card>
                    ) : usersWithViolations.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600">{t('No users with violations')}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {usersWithViolations.map((user) => (
                                <Card key={user.username}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <User className="w-5 h-5 text-blue-500" />
                                                <CardTitle className="text-lg">
                                                    {user.username}
                                                </CardTitle>
                                            </div>
                                            <Badge variant="outline" className="text-red-600 border-red-300">
                                                {user.violationCount || 0} Violations
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Member since: {new Date(user.dateCreated).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Last activity: {new Date(user.lastLogin).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            {user.violations && user.violations.length > 0 && (
                                                <div className="pt-2 border-t border-gray-200">
                                                    <p className="text-sm font-medium text-gray-600 mb-2">Recent Violations:</p>
                                                    <div className="space-y-2">
                                                        {user.violations.slice(0, 3).map((violation, index) => (
                                                            <div key={index} className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                                                                <div className="flex items-center justify-between">
                                                                    <span>{violation.resolutionAction} - {violation.contentType}</span>
                                                                    <span>{new Date(violation.resolvedAt).toLocaleDateString()}</span>
                                                                </div>
                                                                {violation.resolutionNotes && (
                                                                    <p className="text-xs mt-1">{violation.resolutionNotes}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
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

export default CommunityReports;
