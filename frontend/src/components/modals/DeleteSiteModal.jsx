import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Archive } from 'lucide-react';
import { Button } from '../ui/Button';

const DeleteSiteModal = ({
    isOpen,
    onClose,
    onConfirm,
    site,
    loading = false
}) => {
    const [archiveReason, setArchiveReason] = useState('');
    const [selectedReason, setSelectedReason] = useState('');

    const archiveReasons = [
        { value: 'temporary-closure', label: 'Temporary Closure', description: 'Site temporarily closed for renovation, conservation, or other reasons' },
        { value: 'under-review', label: 'Under Review', description: 'Site content or management under administrative review' },
        { value: 'legal-compliance', label: 'Legal Compliance', description: 'Site archived due to legal or regulatory requirements' },
        { value: 'manager-reassignment', label: 'Manager Reassignment', description: 'Site archived pending new manager assignment' },
        { value: 'strategic-decision', label: 'Strategic Decision', description: 'Site archived as part of strategic planning' },
        { value: 'quality-control', label: 'Quality Control', description: 'Site archived for content quality improvements' },
        { value: 'other', label: 'Other', description: 'Other reason not listed above' }
    ];

    const handleConfirm = () => {
        if (!archiveReason.trim()) {
            return;
        }
        onConfirm(archiveReason.trim());
    };

    const handleReasonChange = (reason) => {
        setSelectedReason(reason);
        if (reason === 'other') {
            setArchiveReason('');
        } else {
            const selected = archiveReasons.find(r => r.value === reason);
            setArchiveReason(selected ? selected.label : '');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <Archive className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Archive Heritage Site
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                This action will archive the site
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Warning */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                <p className="font-medium">Important Information</p>
                                <p className="mt-1">
                                    Archiving a site will:
                                </p>
                                <ul className="mt-2 space-y-1 list-disc list-inside">
                                    <li>Hide the site from public view</li>
                                    <li>Preserve all site data and media</li>
                                    <li>Unassign the current manager</li>
                                    <li>Allow restoration at any time</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Site Information */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Site Details</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {site?.nameEn || site?.name || `Site ${site?.id}`}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {site?.region || 'Not specified'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {site?.status || 'Unknown'}
                                </span>
                            </div>
                            {site?.assignedManagerId && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Current Manager:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        ID: {site.assignedManagerId}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Archive Reason */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Archive Reason <span className="text-red-500">*</span>
                        </label>

                        {/* Reason Categories */}
                        <div className="space-y-2">
                            {archiveReasons.map((reason) => (
                                <label key={reason.value} className="flex items-start space-x-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="archiveReason"
                                        value={reason.value}
                                        checked={selectedReason === reason.value}
                                        onChange={() => handleReasonChange(reason.value)}
                                        className="mt-1 text-red-600 focus:ring-red-500"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {reason.label}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {reason.description}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Custom Reason Input */}
                        {selectedReason === 'other' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Specify Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={archiveReason}
                                    onChange={(e) => setArchiveReason(e.target.value)}
                                    placeholder="Please provide a detailed reason for archiving this site..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>
                        )}
                    </div>

                    {/* Confirmation Checkbox */}
                    <div className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            id="confirmArchive"
                            checked={archiveReason.trim().length > 0}
                            onChange={() => { }}
                            className="mt-1 text-red-600 focus:ring-red-500"
                            disabled
                        />
                        <label htmlFor="confirmArchive" className="text-sm text-gray-700 dark:text-gray-300">
                            I understand that this action will archive the heritage site and hide it from public view.
                            All data will be preserved and the site can be restored at any time.
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!archiveReason.trim() || loading}
                        className="flex items-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Archiving...</span>
                            </>
                        ) : (
                            <>
                                <Archive className="w-4 h-4" />
                                <span>Archive Site</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteSiteModal;

