import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    Clock,
    AlertTriangle,
    Eye,
    Edit,
    ArrowRight,
    User,
    Calendar,
    MessageSquare,
    History,
    Shield,
    RefreshCw,
    Send,
    X,
    Info,
    Users,
    FileText,
    MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useGet, usePost } from '../../hooks/useSimpleApi';
import { toast } from 'react-hot-toast';

// Site status configuration based on backend model - CORRECTED for actual business logic
// Using backend enum values (not labels) for API calls
const SITE_STATUSES = {
    'ACTIVE': {
        label: 'Active',
        color: 'green',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        textColor: 'text-green-800 dark:text-green-200',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: CheckCircle,
        description: 'Site is publicly accessible and fully operational',
        allowedTransitions: ['UNDER_CONSERVATION', 'PROPOSED', 'INACTIVE']
    },
    'UNDER_CONSERVATION': {
        label: 'Under Conservation',
        color: 'yellow',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        textColor: 'text-yellow-800 dark:text-yellow-200',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        icon: Clock,
        description: 'Site is undergoing conservation or restoration work',
        allowedTransitions: ['ACTIVE', 'INACTIVE']
    },
    'PROPOSED': {
        label: 'Proposed',
        color: 'blue',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        textColor: 'text-blue-800 dark:text-blue-200',
        borderColor: 'border-blue-200 dark:border-blue-800',
        icon: Eye,
        description: 'Site is proposed for heritage designation',
        allowedTransitions: ['ACTIVE', 'INACTIVE']
    },
    'INACTIVE': {
        label: 'Inactive',
        color: 'gray',
        bgColor: 'bg-gray-100 dark:bg-gray-900/20',
        textColor: 'text-gray-800 dark:text-gray-200',
        borderColor: 'border-gray-200 dark:border-gray-800',
        icon: AlertTriangle,
        description: 'Site is not publicly accessible or temporarily closed',
        allowedTransitions: ['ACTIVE', 'UNDER_CONSERVATION', 'PROPOSED']
    }
    // Note: 'ARCHIVED' status is NOT available for Heritage Managers
    // Only SYSTEM_ADMINISTRATOR can archive sites via delete endpoint
};

// Role-based permissions (matching backend)
const ROLE_PERMISSIONS = {
    'SYSTEM_ADMINISTRATOR': {
        canChangeStatus: true,
        canApproveChanges: true,
        canViewHistory: true,
        canBulkUpdate: true
    },
    'HERITAGE_MANAGER': {
        canChangeStatus: true,
        canApproveChanges: true,
        canViewHistory: true,
        canBulkUpdate: true
    },
    'CONTENT_MANAGER': {
        canChangeStatus: false, // Limited permissions based on backend code
        canApproveChanges: false,
        canViewHistory: true,
        canBulkUpdate: false
    },
    'COMMUNITY_MEMBER': {
        canChangeStatus: false,
        canApproveChanges: false,
        canViewHistory: false,
        canBulkUpdate: false
    }
};

const SiteStatusManager = ({
    site,
    onStatusChange,
    onClose,
    showHistory = true,
    className = '',
    ...props
}) => {
    const { user } = useAuth();
    const { t } = useLanguage();

    // State management
    const [currentStatus, setCurrentStatus] = useState(site?.status || 'Active');
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [reason, setReason] = useState('');
    const [statusHistory, setStatusHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Get user permissions
    const userRole = user?.role || 'COMMUNITY_MEMBER';
    const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['COMMUNITY_MEMBER'];

    // Load status history
    useEffect(() => {
        if (showHistory && site?.id) {
            refetchHistory();
        }
    }, [site?.id, showHistory]);

    // API hooks
    const { data: historyData, loading: historyLoading, refetch: refetchHistory } = useGet(`/api/heritage-sites/${site?.id}/status/history`, {}, {
        onSuccess: (data) => {
            // Format history for display
            const formattedHistory = (data || []).map(entry => ({
                id: entry.changeHistoryId || entry.id,
                fromStatus: entry.previousStatus,
                toStatus: entry.newStatus,
                reason: entry.reason,
                notes: entry.notes,
                changedBy: entry.changedBy,
                changedAt: entry.changedAt,
                success: entry.success
            }));
            setStatusHistory(formattedHistory);
        },
        onError: (error) => {
            console.error('Failed to load status history:', error);
            setStatusHistory([]);
            toast.error('Failed to load status history');
        }
    });

    const updateStatus = usePost(`/api/heritage-sites/${site?.id}/status`, {
        onSuccess: (data) => {
            // Update local state
            setCurrentStatus(selectedStatus);

            // Add to history
            const newHistoryEntry = {
                id: data.changeHistoryId || Date.now(),
                fromStatus: currentStatus,
                toStatus: selectedStatus,
                reason: reason || 'Status updated via dashboard',
                changedBy: user?.username,
                changedAt: data.changedAt || new Date().toISOString(),
                success: true
            };

            setStatusHistory(prev => [newHistoryEntry, ...prev]);

            // Notify parent component
            if (onStatusChange) {
                onStatusChange({
                    ...site,
                    status: selectedStatus
                });
            }

            // Reset form
            setSelectedStatus(null);
            setReason('');
            setShowConfirmation(false);

            // Refresh status history to show the new change
            setTimeout(() => {
                refetchHistory();
            }, 500);

            toast.success(`Site status successfully changed to ${SITE_STATUSES[selectedStatus].label}`);
        },
        onError: (error) => {
            console.error('Failed to change status:', error);
            toast.error(error.response?.data?.message || 'Failed to change site status');
        }
    });

    const loadStatusHistory = async () => {
        try {
            setLoadingHistory(true);
            await refetchHistory();
        } catch (error) {
            console.error('Failed to load status history:', error);
            setStatusHistory([]);
            toast.error('Failed to load status history');
        } finally {
            setLoadingHistory(false);
        }
    };

    // Handle status change
    const handleStatusChange = async () => {
        if (!selectedStatus || !permissions.canChangeStatus) return;

        try {
            setLoading(true);

            // Call backend API to update status
            await updateStatus.execute({
                newStatus: selectedStatus,
                reason: reason || 'Status updated via dashboard'
            });

        } catch (error) {
            // Error handling is done in the hook's onError callback
            console.error('Error in status change handler:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get status configuration
    // Map backend status values to frontend config
    const getStatusConfig = (status) => {
        // Handle different status formats from backend
        let statusKey = status;

        // If status is a label, find the corresponding enum key
        if (status === 'Active') statusKey = 'ACTIVE';
        else if (status === 'Under Conservation') statusKey = 'UNDER_CONSERVATION';
        else if (status === 'Proposed') statusKey = 'PROPOSED';
        else if (status === 'Inactive') statusKey = 'INACTIVE';
        else if (status === 'Archived') statusKey = 'ARCHIVED';

        return SITE_STATUSES[statusKey] || SITE_STATUSES['ACTIVE'];
    };

    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get allowed next statuses
    // Note: Heritage Managers cannot archive sites - only SYSTEM_ADMINISTRATOR can do that
    // via the delete endpoint which sets isActive=false and unassigns the manager
    const getAllowedTransitions = () => {
        const config = getStatusConfig(currentStatus);
        return config.allowedTransitions || [];
    };

    const currentConfig = getStatusConfig(currentStatus);
    const CurrentIcon = currentConfig.icon;

    return (
        <div className={`space-y-6 ${className}`} {...props}>
            {/* Current Status Display */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Shield className="w-5 h-5" />
                            <span>Site Status Management</span>
                        </div>
                        {onClose && (
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Site Info */}
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                {site?.name?.en || site?.name?.rw || site?.name?.fr || 'Heritage Site'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {site?.category} • {site?.region}
                            </p>
                        </div>
                    </div>

                    {/* Current Status */}
                    <div className={`p-4 rounded-lg border ${currentConfig.bgColor} ${currentConfig.borderColor}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CurrentIcon className={`w-6 h-6 ${currentConfig.textColor}`} />
                                <div>
                                    <h4 className={`font-semibold ${currentConfig.textColor}`}>
                                        {currentConfig.label}
                                    </h4>
                                    <p className={`text-sm ${currentConfig.textColor} opacity-80`}>
                                        {currentConfig.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={loadStatusHistory}
                                    disabled={loadingHistory}
                                    className="flex items-center space-x-2"
                                >
                                    {loadingHistory ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4" />
                                    )}
                                    <span>Refresh</span>
                                </Button>

                                {permissions.canChangeStatus && getAllowedTransitions().length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowConfirmation(true)}
                                        className="flex items-center space-x-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span>Change Status</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* No permissions message */}
                    {!permissions.canChangeStatus && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                                <Info className="w-4 h-4" />
                                <span className="text-sm">
                                    You don't have permission to change site status. Contact a Heritage Manager for assistance.
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Status Change Modal */}
            <AnimatePresence>
                {showConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowConfirmation(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Change Site Status
                                </h3>

                                {/* Status Selection */}
                                <div className="space-y-3 mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        New Status
                                    </label>
                                    <div className="space-y-2">
                                        {getAllowedTransitions().map((status, index) => {
                                            const config = getStatusConfig(status);
                                            const Icon = config.icon;

                                            return (
                                                <button
                                                    key={`${status}-${index}`}
                                                    onClick={() => setSelectedStatus(status)}
                                                    className={`w-full p-3 rounded-lg border text-left transition-all ${selectedStatus === status
                                                        ? `${config.bgColor} ${config.borderColor} ${config.textColor}`
                                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <Icon className={`w-5 h-5 ${selectedStatus === status ? config.textColor : 'text-gray-400'
                                                            }`} />
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {config.label}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {config.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Reason for Change
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Please provide a reason for this status change..."
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setShowConfirmation(false);
                                            setSelectedStatus(null);
                                            setReason('');
                                        }}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleStatusChange}
                                        disabled={!selectedStatus || loading}
                                        className="flex items-center space-x-2"
                                    >
                                        {loading ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        <span>{loading ? 'Changing...' : 'Change Status'}</span>
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Status History */}
            {showHistory && permissions.canViewHistory && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <History className="w-5 h-5" />
                            <span>Status History</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={loadStatusHistory}
                                disabled={loadingHistory}
                            >
                                {loadingHistory ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingHistory ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                                <span className="ml-2 text-gray-500">Loading history...</span>
                            </div>
                        ) : statusHistory.length > 0 ? (
                            <div className="space-y-4">
                                {statusHistory.map((entry, index) => {
                                    const fromConfig = entry.fromStatus ? getStatusConfig(entry.fromStatus) : null;
                                    const toConfig = getStatusConfig(entry.toStatus);

                                    return (
                                        <div key={entry.id || `status-change-${index}`} className="relative">
                                            {index < statusHistory.length - 1 ? (
                                                <div key={`connector-${index}`} className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200 dark:bg-gray-700"></div>
                                            ) : null}

                                            <div className="flex items-start space-x-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toConfig.bgColor}`}>
                                                    <toConfig.icon className={`w-4 h-4 ${toConfig.textColor}`} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        {fromConfig ? (
                                                            <React.Fragment key={`from-status-${index}`}>
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${fromConfig.bgColor} ${fromConfig.textColor}`}>
                                                                    {fromConfig.label}
                                                                </span>
                                                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                                            </React.Fragment>
                                                        ) : null}
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${toConfig.bgColor} ${toConfig.textColor}`}>
                                                            {toConfig.label}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-gray-900 dark:text-white mb-2">
                                                        {entry.reason}
                                                    </p>

                                                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                                        <div className="flex items-center space-x-1">
                                                            <User className="w-3 h-3" />
                                                            <span>by {entry.changedBy}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{formatTimestamp(entry.changedAt)}</span>
                                                        </div>
                                                        {entry.approvedBy ? (
                                                            <div key={`approval-${index}`} className="flex items-center space-x-1">
                                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                                                <span>approved by {entry.approvedBy}</span>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No status changes recorded</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default SiteStatusManager;
