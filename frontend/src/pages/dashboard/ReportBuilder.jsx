import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui';
import { FileText, Download, Filter, Calendar, Users, Building, Shield, BarChart3, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGet, usePost } from '../../hooks/useSimpleApi';

const ReportBuilder = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // State for report filters
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        userRoles: [],
        siteStatuses: [],
        contentTypes: [],
        exportFormat: 'CSV'
    });

    // State for report data
    const [reportData, setReportData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('builder');

    // API hooks
    const {
        data: availableFilters,
        loading: filtersLoading,
        error: filtersError
    } = useGet('/api/admin/reports/available-filters');

    const {
        data: reportTemplates,
        loading: templatesLoading,
        error: templatesError
    } = useGet('/api/admin/reports/templates');

    // Generate report function
    const generateReport = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/admin/reports/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(filters)
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const data = await response.json();
            setReportData(data);
            toast.success('Report generated successfully!');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    // Export report function
    const exportReport = async (format = 'CSV') => {
        if (!reportData) {
            toast.error('Please generate a report first');
            return;
        }

        try {
            const response = await fetch('/api/admin/reports/export/csv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(filters)
            });

            if (!response.ok) {
                throw new Error('Failed to export report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `system_report_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Report exported successfully!');
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('Failed to export report');
        }
    };

    // Generate report from template
    const generateFromTemplate = async (templateId) => {
        setIsGenerating(true);
        try {
            const response = await fetch(`/api/admin/reports/templates/${templateId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(filters)
            });

            if (!response.ok) {
                throw new Error('Failed to generate report from template');
            }

            const data = await response.json();
            setReportData(data);
            toast.success('Report generated from template successfully!');
        } catch (error) {
            console.error('Error generating report from template:', error);
            toast.error('Failed to generate report from template');
        } finally {
            setIsGenerating(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Handle date range change
    const handleDateRangeChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Handle multi-select changes
    const handleMultiSelectChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    if (!user || user.role !== 'SYSTEM_ADMINISTRATOR') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-semibold mb-2">{t('Access Denied')}</h2>
                        <p className="text-gray-600">{t('Only system administrators can access this page.')}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('Report Builder')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('Generate comprehensive system reports with custom filters')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => generateReport()}
                        disabled={isGenerating}
                        className="px-6 py-3"
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        {isGenerating ? t('Generating...') : t('Generate Report')}
                    </Button>
                    {reportData && (
                        <Button
                            onClick={() => exportReport(filters.exportFormat)}
                            variant="outline"
                            className="px-6 py-3"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            {t('Export')} {filters.exportFormat}
                        </Button>
                    )}
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="builder">
                        <Filter className="w-4 h-4 mr-2" />
                        {t('Report Builder')}
                    </TabsTrigger>
                    <TabsTrigger value="templates">
                        <FileText className="w-4 h-4 mr-2" />
                        {t('Templates')}
                    </TabsTrigger>
                    <TabsTrigger value="results">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        {t('Results')}
                    </TabsTrigger>
                </TabsList>

                {/* Report Builder Tab */}
                <TabsContent value="builder" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Date Range Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    {t('Date Range')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startDate">{t('Start Date')}</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={filters.startDate}
                                            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="endDate">{t('End Date')}</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={filters.endDate}
                                            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Export Format */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Download className="w-5 h-5" />
                                    {t('Export Format')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select value={filters.exportFormat} onValueChange={(value) => handleFilterChange('exportFormat', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CSV">CSV</SelectItem>
                                        <SelectItem value="PDF">PDF</SelectItem>
                                        <SelectItem value="EXCEL">Excel</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* User Role Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    {t('User Roles')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {availableFilters?.userRoles?.map((role) => (
                                    <div key={role} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`role-${role}`}
                                            checked={filters.userRoles.includes(role)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    handleMultiSelectChange('userRoles', [...filters.userRoles, role]);
                                                } else {
                                                    handleMultiSelectChange('userRoles', filters.userRoles.filter(r => r !== role));
                                                }
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                        <Label htmlFor={`role-${role}`} className="text-sm">{role}</Label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Site Status Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    {t('Site Statuses')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {availableFilters?.siteStatuses?.map((status) => (
                                    <div key={status} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`status-${status}`}
                                            checked={filters.siteStatuses.includes(status)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    handleMultiSelectChange('siteStatuses', [...filters.siteStatuses, status]);
                                                } else {
                                                    handleMultiSelectChange('siteStatuses', filters.siteStatuses.filter(s => s !== status));
                                                }
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                        <Label htmlFor={`status-${status}`} className="text-sm">{status}</Label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Content Type Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    {t('Content Types')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {availableFilters?.contentTypes?.map((type) => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`type-${type}`}
                                            checked={filters.contentTypes.includes(type)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    handleMultiSelectChange('contentTypes', [...filters.contentTypes, type]);
                                                } else {
                                                    handleMultiSelectChange('contentTypes', filters.contentTypes.filter(t => t !== type));
                                                }
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                        <Label htmlFor={`type-${type}`} className="text-sm">{type}</Label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reportTemplates?.map((template) => (
                            <Card key={template.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="text-lg">{template.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {template.description}
                                    </p>
                                    <Button
                                        onClick={() => generateFromTemplate(template.id)}
                                        disabled={isGenerating}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        {isGenerating ? t('Generating...') : t('Use Template')}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Results Tab */}
                <TabsContent value="results" className="space-y-6 mt-6">
                    {reportData ? (
                        <div className="space-y-6">
                            {/* Report Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        {t('Report Summary')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {reportData.userAnalytics?.totalUsers || 0}
                                            </div>
                                            <div className="text-sm text-blue-600 dark:text-blue-400">{t('Total Users')}</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {reportData.heritageAnalytics?.totalSites || 0}
                                            </div>
                                            <div className="text-sm text-green-600 dark:text-green-400">{t('Heritage Sites')}</div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                {reportData.contentAnalytics?.totalArtifacts || 0}
                                            </div>
                                            <div className="text-sm text-purple-600 dark:text-purple-400">{t('Artifacts')}</div>
                                        </div>
                                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                {reportData.securityAnalytics?.securityStatus?.lockedAccounts || 0}
                                            </div>
                                            <div className="text-sm text-orange-600 dark:text-orange-400">{t('Locked Accounts')}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detailed Analytics */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* User Analytics */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            {t('User Analytics')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {reportData.userAnalytics?.roleDistribution && Object.entries(reportData.userAnalytics.roleDistribution).map(([role, count]) => (
                                            <div key={role} className="flex justify-between items-center">
                                                <span className="text-sm font-medium">{role}</span>
                                                <Badge variant="secondary">{count}</Badge>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Heritage Analytics */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building className="w-5 h-5" />
                                            {t('Heritage Analytics')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {reportData.heritageAnalytics?.statusDistribution && Object.entries(reportData.heritageAnalytics.statusDistribution).map(([status, count]) => (
                                            <div key={status} className="flex justify-between items-center">
                                                <span className="text-sm font-medium">{status}</span>
                                                <Badge variant="secondary">{count}</Badge>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Export Options */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Download className="w-5 h-5" />
                                        {t('Export Options')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <Button onClick={() => exportReport('CSV')} variant="outline">
                                            <Download className="w-4 h-4 mr-2" />
                                            Export CSV
                                        </Button>
                                        <Button onClick={() => exportReport('PDF')} variant="outline" disabled>
                                            <Download className="w-4 h-4 mr-2" />
                                            Export PDF
                                        </Button>
                                        <Button onClick={() => exportReport('EXCEL')} variant="outline" disabled>
                                            <Download className="w-4 h-4 mr-2" />
                                            Export Excel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    {t('No report data available. Generate a report first.')}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ReportBuilder;


