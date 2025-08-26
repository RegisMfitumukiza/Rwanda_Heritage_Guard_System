import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Save,
    Shield,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';


const FolderPermissionModal = ({
    isOpen,
    onClose,
    folder,
    onSave,
    className = ''
}) => {
    const [permissions, setPermissions] = useState({
        allowedRoles: []
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Available roles and users
    const availableRoles = [
        'SYSTEM_ADMINISTRATOR',
        'HERITAGE_MANAGER',
        'CONTENT_MANAGER',
        'COMMUNITY_MEMBER',
        'PUBLIC'
    ];



    // Initialize permissions from folder
    useEffect(() => {
        if (folder) {
            setPermissions({
                allowedRoles: folder.allowedRoles || ['SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER']
            });
        }
    }, [folder]);

    const handleRoleToggle = (role) => {
        setPermissions(prev => ({
            ...prev,
            allowedRoles: prev.allowedRoles.includes(role)
                ? prev.allowedRoles.filter(r => r !== role)
                : [...prev.allowedRoles, role]
        }));
    };





    const handleSubmit = async (e) => {
        e.preventDefault();

        if (permissions.allowedRoles.length === 0) {
            setErrors({ roles: 'At least one role must be selected' });
            return;
        }

        try {
            setSaving(true);

            // Update folder permissions - only send the fields we want to update
            const updatedFolder = {
                id: folder.id,
                allowedRoles: permissions.allowedRoles
            };

            if (onSave) {
                await onSave(updatedFolder);
            }

            toast.success('Folder permissions updated successfully');
            onClose();
        } catch (error) {
            console.error('Failed to update permissions:', error);
            toast.error('Failed to update folder permissions');
        } finally {
            setSaving(false);
        }
    };



    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Folder Permissions
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Manage access control for: {folder?.name}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                disabled={saving}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto min-h-0">


                            {/* Role-Based Access */}
                            <div>
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                                    Role-Based Access Control
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    Select which roles can access this folder. The "PUBLIC" role makes the folder visible to all users.
                                </p>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {availableRoles.map(role => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => handleRoleToggle(role)}
                                            disabled={saving}
                                            className={`p-3 border rounded-lg text-left transition-all ${permissions.allowedRoles.includes(role)
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <CheckCircle className={`w-4 h-4 ${permissions.allowedRoles.includes(role) ? 'text-blue-600' : 'text-gray-400'
                                                    }`} />
                                                <span className={`text-xs font-medium ${permissions.allowedRoles.includes(role) ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {role.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>




                            </div>



                            {/* Error Display */}
                            {Object.keys(errors).length > 0 && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    {Object.entries(errors).map(([field, message]) => (
                                        <p key={field} className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span>{message}</span>
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex items-center space-x-2"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{saving ? 'Saving...' : 'Save Permissions'}</span>
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FolderPermissionModal;
