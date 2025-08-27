import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Filter, RefreshCw, Building2, Shield, Image } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { reportsApi } from '../../services/api/reportsApi';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

const ReportBuilder = () => {
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [filters, setFilters] = useState({
        siteStatus: 'ACTIVE',
        artifactAuthStatus: 'AUTHENTICATED',
        mediaType: 'IMAGE'
    });

    // Filter options
    const siteStatusOptions = [
        { value: 'ACTIVE', label: 'Active Sites', icon: Building2, color: 'text-green-600' },
        { value: 'PROPOSED', label: 'Proposed Sites', icon: Building2, color: 'text-blue-600' },
        { value: 'CONSERVATION', label: 'Under Conservation', icon: Building2, color: 'text-yellow-600' },
        { value: 'ARCHIVED', label: 'Archived Sites', icon: Building2, color: 'text-gray-600' }
    ];

    const artifactAuthOptions = [
        { value: 'AUTHENTICATED', label: 'Authenticated', icon: Shield, color: 'text-green-600' },
        { value: 'PENDING_AUTHENTICATION', label: 'Pending Review', icon: Shield, color: 'text-yellow-600' },
        { value: 'UNAUTHENTICATED', label: 'Not Verified', icon: Shield, color: 'text-red-600' },
        { value: 'REJECTED', label: 'Rejected', icon: Shield, color: 'text-red-800' }
    ];

    const mediaTypeOptions = [
        { value: 'IMAGE', label: 'Images', icon: Image, color: 'text-blue-600' },
        { value: 'DOCUMENT', label: 'Documents', icon: FileText, color: 'text-purple-600' },
        { value: 'VIDEO', label: 'Videos', icon: Image, color: 'text-red-600' },
        { value: 'AUDIO', label: 'Audio', icon: Image, color: 'text-green-600' }
    ];

    const generateReport = async () => {
        setLoading(true);
        try {
            // Use the new reports API service
            const response = await reportsApi.generateReport(filters);

            setReportData({
                sites: response.sites || [],
                artifacts: response.artifacts || [],
                media: response.media || [],
                generatedAt: new Date(),
                filters,
                summary: response.summary || {}
            });

            toast.success('Report generated successfully!');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!reportData) return;

        const doc = new jsPDF();

        // Add company logo placeholder (you can replace with actual logo)
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text('🏛️ HeritageGuard', 20, 30);

        // Add title
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Heritage Sites & Artifacts Report', 20, 50);

        // Add generation date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${format(reportData.generatedAt, 'PPP')}`, 20, 60);

        // Add filters summary
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Report Filters:', 20, 80);
        doc.setFontSize(10);
        doc.text(`• Site Status: ${filters.siteStatus}`, 25, 90);
        doc.text(`• Artifact Authentication: ${filters.artifactAuthStatus}`, 25, 100);
        doc.text(`• Media Type: ${filters.mediaType}`, 25, 110);

        // Heritage Sites Table
        if (reportData.sites.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Heritage Sites', 20, 130);

            const sitesTableData = reportData.sites.map(site => [
                site.nameEn || site.name || 'N/A',
                site.region || 'N/A',
                site.status || 'N/A',
                site.category || 'N/A'
            ]);

            doc.autoTable({
                startY: 140,
                head: [['Site Name', 'Region', 'Status', 'Category']],
                body: sitesTableData,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] }
            });
        }

        // Artifacts Table
        if (reportData.artifacts.length > 0) {
            const currentY = doc.lastAutoTable.finalY + 20;
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Artifacts', 20, currentY);

            const artifactsTableData = reportData.artifacts.map(artifact => [
                artifact.nameEn || artifact.name || 'N/A',
                artifact.category || 'N/A',
                artifact.authenticationStatus || 'N/A',
                artifact.condition || 'N/A'
            ]);

            doc.autoTable({
                startY: currentY + 10,
                head: [['Artifact Name', 'Category', 'Auth Status', 'Condition']],
                body: artifactsTableData,
                theme: 'grid',
                headStyles: { fillColor: [39, 174, 96] }
            });
        }

        // Media Table
        if (reportData.media.length > 0) {
            const currentY = doc.lastAutoTable.finalY + 20;
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Media Content', 20, currentY);

            const mediaTableData = reportData.media.map(media => [
                media.title || media.name || 'N/A',
                media.mediaType || media.fileType || 'N/A',
                media.fileSize ? `${(media.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A',
                media.uploadDate ? format(new Date(media.uploadDate), 'PP') : 'N/A'
            ]);

            doc.autoTable({
                startY: currentY + 10,
                head: [['Title', 'Type', 'Size', 'Upload Date']],
                body: mediaTableData,
                theme: 'grid',
                headStyles: { fillColor: [155, 89, 182] }
            });
        }

        // Add summary
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Report Summary:', 20, finalY);
        doc.setFontSize(10);
        doc.text(`• Total Heritage Sites: ${reportData.sites.length}`, 25, finalY + 10);
        doc.text(`• Total Artifacts: ${reportData.artifacts.length}`, 25, finalY + 20);
        doc.text(`• Total Media Files: ${reportData.media.length}`, 25, finalY + 30);

        // Save the PDF
        doc.save(`heritageguard-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.pdf`);
        toast.success('PDF report downloaded successfully!');
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            siteStatus: 'ACTIVE',
            artifactAuthStatus: 'AUTHENTICATED',
            mediaType: 'IMAGE'
        });
        setReportData(null);
    };

    return (
        <div className="p-6 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Report Builder
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Generate comprehensive reports for heritage sites, artifacts, and media content
                </p>
            </motion.div>

            {/* Filters Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Report Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Site Status Filter */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Heritage Site Status
                                </label>
                                <div className="space-y-2">
                                    {siteStatusOptions.map((option) => {
                                        const Icon = option.icon;
                                        return (
                                            <label
                                                key={option.value}
                                                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${filters.siteStatus === option.value
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="siteStatus"
                                                    value={option.value}
                                                    checked={filters.siteStatus === option.value}
                                                    onChange={(e) => handleFilterChange('siteStatus', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <Icon className={`h-5 w-5 mr-3 ${option.color}`} />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {option.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Artifact Authentication Filter */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Artifact Authentication Status
                                </label>
                                <div className="space-y-2">
                                    {artifactAuthOptions.map((option) => {
                                        const Icon = option.icon;
                                        return (
                                            <label
                                                key={option.value}
                                                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${filters.artifactAuthStatus === option.value
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="artifactAuthStatus"
                                                    value={option.value}
                                                    checked={filters.artifactAuthStatus === option.value}
                                                    onChange={(e) => handleFilterChange('artifactAuthStatus', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <Icon className={`h-5 w-5 mr-3 ${option.color}`} />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {option.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Media Type Filter */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Media Content Type
                                </label>
                                <div className="space-y-2">
                                    {mediaTypeOptions.map((option) => {
                                        const Icon = option.icon;
                                        return (
                                            <label
                                                key={option.value}
                                                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${filters.mediaType === option.value
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="mediaType"
                                                    value={option.value}
                                                    checked={filters.mediaType === option.value}
                                                    onChange={(e) => handleFilterChange('mediaType', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <Icon className={`h-5 w-5 mr-3 ${option.color}`} />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {option.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                onClick={generateReport}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                )}
                                {loading ? 'Generating...' : 'Generate Report'}
                            </Button>

                            <Button
                                onClick={resetFilters}
                                variant="outline"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Reset Filters
                            </Button>

                            {reportData && (
                                <Button
                                    onClick={downloadPDF}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Report Preview */}
            {reportData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Report Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {reportData.sites.length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Heritage Sites
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {reportData.artifacts.length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Artifacts
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {reportData.media.length}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Media Files
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                Report generated on {format(reportData.generatedAt, 'PPP')} at {format(reportData.generatedAt, 'p')}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default ReportBuilder;
