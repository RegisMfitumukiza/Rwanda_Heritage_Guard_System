import React, { useState, useEffect } from 'react';
import {
    Clock,
    User,
    Edit3,
    Plus,
    Trash2,
    Filter,
    Search,
    Calendar,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

const SiteChangeHistory = ({ siteId, siteName, onRefresh }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredHistory, setFilteredHistory] = useState([]);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAction, setSelectedAction] = useState('all');
    const [selectedChangeType, setSelectedChangeType] = useState('all');
    const [selectedField, setSelectedField] = useState('all');

    // Available filters
    const actions = ['all', 'created', 'updated', 'deleted'];
    const changeTypes = ['all', 'CONTENT', 'STATUS', 'MANAGEMENT', 'LOCATION', 'MEDIA'];
    const fields = [
        'all',
        'nameEn', 'nameRw', 'nameFr',
        'descriptionEn', 'descriptionRw', 'descriptionFr',
        'significanceEn', 'significanceRw', 'significanceFr',
        'status', 'category', 'ownershipType', 'region',
        'address', 'gpsLatitude', 'gpsLongitude', 'establishmentYear',
        'contactInfo', 'assignedManagerId'
    ];

    useEffect(() => {
        loadHistory();
    }, [siteId]);

    useEffect(() => {
        filterHistory();
    }, [history, searchTerm, selectedAction, selectedChangeType, selectedField]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/heritage-sites/${siteId}/history`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to load history: ${response.status}`);
            }

            const data = await response.json();
            setHistory(data);
        } catch (error) {
            console.error('Error loading history:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const filterHistory = () => {
        let filtered = [...history];

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(item => {
                // Search in field display name
                if (item.fieldDisplayName?.toLowerCase().includes(searchLower)) return true;

                // Search in changed by user
                if (item.changedBy?.toLowerCase().includes(searchLower)) return true;

                // Search in change summary
                if (item.changeSummary?.toLowerCase().includes(searchLower)) return true;

                // Search in old and new values (handle null/undefined)
                const oldValue = item.oldValue?.toString().toLowerCase() || '';
                const newValue = item.newValue?.toString().toLowerCase() || '';
                if (oldValue.includes(searchLower) || newValue.includes(searchLower)) return true;

                // Search in field name
                if (item.fieldName?.toLowerCase().includes(searchLower)) return true;

                return false;
            });
        }

        // Action filter
        if (selectedAction !== 'all') {
            filtered = filtered.filter(item => item.action === selectedAction);
        }

        // Change type filter
        if (selectedChangeType !== 'all') {
            filtered = filtered.filter(item => item.changeType === selectedChangeType);
        }

        // Field filter
        if (selectedField !== 'all') {
            filtered = filtered.filter(item => item.fieldName === selectedField);
        }

        setFilteredHistory(filtered);
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'created':
                return <Plus className="w-4 h-4 text-green-500" />;
            case 'updated':
                return <Edit3 className="w-4 h-4 text-blue-500" />;
            case 'deleted':
                return <Trash2 className="w-4 h-4 text-red-500" />;
            default:
                return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    const getChangeTypeBadge = (changeType) => {
        const colors = {
            'CONTENT': 'bg-blue-100 text-blue-800',
            'STATUS': 'bg-yellow-100 text-yellow-800',
            'MANAGEMENT': 'bg-purple-100 text-purple-800',
            'LOCATION': 'bg-green-100 text-green-800',
            'MEDIA': 'bg-pink-100 text-pink-800'
        };

        return (
            <Badge className={`${colors[changeType] || 'bg-gray-100 text-gray-800'} text-xs`}>
                {changeType}
            </Badge>
        );
    };

    const getActionBadge = (action) => {
        const colors = {
            'created': 'bg-green-100 text-green-800',
            'updated': 'bg-blue-100 text-blue-800',
            'deleted': 'bg-red-100 text-red-800'
        };

        return (
            <Badge className={`${colors[action] || 'bg-gray-100 text-gray-800'} text-xs`}>
                {action}
            </Badge>
        );
    };

    const getFieldDisplayName = (fieldName) => {
        const fieldNames = {
            'nameEn': 'Site Name (English)',
            'nameRw': 'Site Name (Kinyarwanda)',
            'nameFr': 'Site Name (French)',
            'descriptionEn': 'Description (English)',
            'descriptionRw': 'Description (Kinyarwanda)',
            'descriptionFr': 'Description (French)',
            'significanceEn': 'Historical Significance (English)',
            'significanceRw': 'Historical Significance (Kinyarwanda)',
            'significanceFr': 'Historical Significance (French)',
            'status': 'Status',
            'category': 'Category',
            'ownershipType': 'Ownership Type',
            'region': 'Region',
            'address': 'Address',
            'gpsLatitude': 'GPS Latitude',
            'gpsLongitude': 'GPS Longitude',
            'establishmentYear': 'Date of Establishment',
            'contactInfo': 'Contact Information',
            'assignedManagerId': 'Assigned Manager'
        };

        return fieldNames[fieldName] || fieldName;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center space-x-2">
                        <Clock className="w-5 h-5 animate-spin text-blue-500" />
                        <span className="text-gray-600">Loading change history...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span>Error loading history: {error}</span>
                    </div>
                    <Button
                        onClick={loadHistory}
                        variant="outline"
                        className="mt-3"
                    >
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Change History</span>
                    {history.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {history.length} changes
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent>
                {/* Filters */}
                <div className="mb-6 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search in history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Action Filter */}
                        <select
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {actions.map(action => (
                                <option key={action} value={action}>
                                    {action === 'all' ? 'All Actions' : action.charAt(0).toUpperCase() + action.slice(1)}
                                </option>
                            ))}
                        </select>

                        {/* Change Type Filter */}
                        <select
                            value={selectedChangeType}
                            onChange={(e) => setSelectedChangeType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {changeTypes.map(type => (
                                <option key={type} value={type}>
                                    {type === 'all' ? 'All Types' : type}
                                </option>
                            ))}
                        </select>

                        {/* Field Filter */}
                        <select
                            value={selectedField}
                            onChange={(e) => setSelectedField(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {fields.map(field => (
                                <option key={field} value={field}>
                                    {field === 'all' ? 'All Fields' : getFieldDisplayName(field)}
                                </option>
                            ))}
                        </select>

                        {/* Refresh Button */}
                        <Button
                            onClick={loadHistory}
                            variant="outline"
                            className="flex items-center space-x-2"
                        >
                            <Clock className="w-4 h-4" />
                            <span>Refresh</span>
                        </Button>
                    </div>
                </div>

                {/* History List */}
                {filteredHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {history.length === 0 ? (
                            <div>
                                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No change history available for this site.</p>
                                <p className="text-sm">Changes will appear here once modifications are made.</p>
                            </div>
                        ) : (
                            <div>
                                <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No changes match your current filters.</p>
                                <p className="text-sm">Try adjusting your search criteria.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredHistory.map((item) => (
                            <div
                                key={item.id}
                                className={`p-4 border rounded-lg ${item.isSignificantChange
                                    ? 'border-blue-200 bg-blue-50'
                                    : 'border-gray-200 bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        {getActionIcon(item.action)}
                                        <div>
                                            <h4 className="font-medium text-gray-900">
                                                {item.fieldDisplayName || item.fieldName}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {item.changeSummary}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {getActionBadge(item.action)}
                                        {getChangeTypeBadge(item.changeType)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    {item.oldValue && (
                                        <div>
                                            <span className="text-xs font-medium text-gray-500 uppercase">Previous Value:</span>
                                            <p className="text-sm text-gray-700 bg-white px-2 py-1 rounded border">
                                                {item.oldValue}
                                            </p>
                                        </div>
                                    )}

                                    {item.newValue && (
                                        <div>
                                            <span className="text-xs font-medium text-gray-500 uppercase">New Value:</span>
                                            <p className="text-sm text-gray-700 bg-white px-2 py-1 rounded border">
                                                {item.newValue}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center space-x-4">
                                        <span className="flex items-center space-x-1">
                                            <User className="w-3 h-3" />
                                            <span>{item.changedBy}</span>
                                        </span>

                                        <span className="flex items-center space-x-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{item.formattedChangedAt}</span>
                                        </span>
                                    </div>

                                    {item.reason && (
                                        <span className="text-blue-600 font-medium">
                                            Reason: {item.reason}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SiteChangeHistory;

