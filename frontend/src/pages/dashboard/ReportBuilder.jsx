import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui';
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '../ui';
import { FileText, Filter, Calendar, Users, Building, Shield, BarChart3, Image, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGet, usePost } from '../../hooks/useSimpleApi';
import reportsApi from '../../services/api/reportsApi';

const ReportBuilder = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    // State for report filters
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        userRoles: [],
        siteStatuses: [],
        contentTypes: [],
        artifactAuthStatuses: [], // For artifact authentication status
        mediaTypes: [], // For media type filtering
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

    // Initialize filters when availableFilters data loads
    useEffect(() => {
        if (availableFilters && !filtersLoading) {
            console.log('🔍 Available filters from backend:', availableFilters);
            setFilters(prev => ({
                ...prev,
                userRoles: availableFilters.userRoles || [],
                siteStatuses: availableFilters.siteStatuses || [],
                contentTypes: availableFilters.contentTypes || [],
                artifactAuthStatuses: availableFilters.artifactAuthStatuses || [],
                mediaTypes: availableFilters.mediaTypes || []
            }));
        }
    }, [availableFilters, filtersLoading]);

    // Generate report function - Now uses reportsApi service
    const generateReport = async () => {
        setIsGenerating(true);
        try {
            // Convert filters to the format expected by PDF endpoint
            const pdfFilters = {
                siteStatus: filters.siteStatuses && filters.siteStatuses.length > 0 ? filters.siteStatuses[0] : 'ACTIVE',
                artifactAuthStatus: filters.artifactAuthStatuses && filters.artifactAuthStatuses.length > 0 ? filters.artifactAuthStatuses[0] : 'AUTHENTICATED',
                mediaType: filters.mediaTypes && filters.mediaTypes.length > 0 ? filters.mediaTypes[0] : 'IMAGE'
            };

            console.log('🔍 Current filters state:', filters);
            console.log('🔍 Mapped pdfFilters:', pdfFilters);
            console.log('🚀 Calling PDF endpoint with filters:', pdfFilters);
            console.log(' Endpoint URL: /api/admin/reports/generate-pdf');

            // Use reportsApi service instead of direct httpClient calls
            const response = await reportsApi.generatePdfReport(pdfFilters);

            console.log(' Response status:', response.status);
            console.log('📥 Response headers:', response.headers);
            console.log('📥 Content-Type:', response.headers['content-type']);

            if (response.status !== 200) {
                const errorText = response.data;
                console.error('❌ Response error:', errorText);
                throw new Error(`Failed to generate PDF report: ${response.status} - ${errorText}`);
            }

            // Check if we got a PDF
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('application/pdf')) {
                console.log('✅ Got PDF response, downloading...');

                // Handle PDF response
                const blob = response.data;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `heritage_report_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setReportData({ generated: true }); // Set minimal data to show success
                toast.success('PDF report generated and downloaded successfully!');
            } else {
                console.error('❌ Expected PDF but got:', contentType);
                const responseText = response.data;
                console.error('❌ Response body:', responseText);
                throw new Error('Server returned non-PDF response. Check backend logs.');
            }
        } catch (error) {
            console.error('❌ Error generating PDF report:', error);
            toast.error(`Failed to generate PDF report: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // Generate report from template - Now uses reportsApi service
    const generateFromTemplate = async (templateId) => {
        setIsGenerating(true);
        try {
            // Use reportsApi service instead of direct httpClient calls
            const response = await reportsApi.generateFromTemplate(templateId, filters);

            if (response.status !== 200) {
                throw new Error('Failed to generate report from template');
            }

            const data = response.data;
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
                        {isGenerating ? t('Generating PDF...') : t('Generate PDF Report')}
                    </Button>
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
                    {filtersLoading ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-400">Loading filter options...</p>
                            </CardContent>
                        </Card>
                    ) : filtersError ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                                <p className="text-red-600 dark:text-red-400">Failed to load filter options. Please refresh the page.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
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
                                        )) || (
                                                <p className="text-gray-500 text-sm">No user roles available</p>
                                            )}
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
                                        )) || (
                                                <p className="text-gray-500 text-sm">No site statuses available</p>
                                            )}
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
                                        )) || (
                                                <p className="text-gray-500 text-sm">No content types available</p>
                                            )}
                                    </CardContent>
                                </Card>

                                {/* Artifact Authentication Status Filters */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="w-5 h-5" />
                                            {t('Artifact Authentication Status')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {availableFilters?.artifactAuthStatuses?.map((status) => (
                                            <div key={status} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`auth-${status}`}
                                                    checked={filters.artifactAuthStatuses.includes(status)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            handleMultiSelectChange('artifactAuthStatuses', [...filters.artifactAuthStatuses, status]);
                                                        } else {
                                                            handleMultiSelectChange('artifactAuthStatuses', filters.artifactAuthStatuses.filter(s => s !== status));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300"
                                                />
                                                <Label htmlFor={`auth-${status}`} className="text-sm">{status}</Label>
                                            </div>
                                        )) || (
                                                <p className="text-gray-500 text-sm">No authentication statuses available</p>
                                            )}
                                    </CardContent>
                                </Card>

                                {/* Media Type Filters */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Image className="w-5 h-5" />
                                            {t('Media Types')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {availableFilters?.mediaTypes?.map((type) => (
                                            <div key={type} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`media-${type}`}
                                                    checked={filters.mediaTypes.includes(type)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            handleMultiSelectChange('mediaTypes', [...filters.mediaTypes, type]);
                                                        } else {
                                                            handleMultiSelectChange('mediaTypes', filters.mediaTypes.filter(t => t !== type));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300"
                                                />
                                                <Label htmlFor={`media-${type}`} className="text-sm">{type}</Label>
                                            </div>
                                        )) || (
                                                <p className="text-gray-500 text-sm">No media types available</p>
                                            )}
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
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
                            {/* Report Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        {t('Report Status')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                            PDF Report Generated Successfully!
                                        </div>
                                        <div className="text-sm text-green-600 dark:text-green-400">
                                            Your report has been downloaded automatically
                                        </div>
                                        <div className="mt-4 text-xs text-gray-500">
                                            Check your downloads folder for the PDF file
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Instructions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        {t('What\'s in Your PDF Report')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            <span>Heritage logo and platform title</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                            <span>Report generation date and filters applied</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                            <span>Summary counts of all data categories</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                            <span>Detailed tables with all your data</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    Generate a report to see results here
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