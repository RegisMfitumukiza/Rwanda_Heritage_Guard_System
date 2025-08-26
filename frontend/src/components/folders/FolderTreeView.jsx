import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    FolderPlus,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Move,
    Copy,
    Eye,
    EyeOff,
    Archive,
    Building,
    Hammer,
    Wrench,
    BookOpen,
    Scale,
    Briefcase,
    Newspaper,
    Camera,
    Map,
    FileText,
    Lock,
    Users
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

// Icon mapping for folder types
const FOLDER_ICONS = {
    GENERAL: Folder,
    HISTORICAL: Archive,
    ARCHAEOLOGICAL: Hammer,
    ARCHITECTURAL: Building,
    CONSERVATION: Wrench,
    RESEARCH: BookOpen,
    LEGAL: Scale,
    ADMINISTRATIVE: Briefcase,
    MEDIA_COVERAGE: Newspaper,
    PHOTOGRAPHS: Camera,
    MAPS: Map,
    REPORTS: FileText
};

// Color mapping for folder types
const FOLDER_COLORS = {
    GENERAL: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    HISTORICAL: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    ARCHAEOLOGICAL: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    ARCHITECTURAL: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    CONSERVATION: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    RESEARCH: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
    LEGAL: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    ADMINISTRATIVE: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20',
    MEDIA_COVERAGE: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20',
    PHOTOGRAPHS: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20',
    MAPS: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    REPORTS: 'text-slate-600 bg-slate-50 dark:bg-slate-900/20'
};

const FolderTreeItem = ({
    folder,
    level = 0,
    isExpanded,
    onToggle,
    onSelect,
    onEdit,
    onDelete,
    onMove,
    onAddSubfolder,
    selectedFolderId,
    draggedFolderId,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    className = ''
}) => {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const contextMenuRef = useRef(null);

    const hasChildren = folder.children && folder.children.length > 0;
    const isSelected = selectedFolderId === folder.id;
    const isDragging = draggedFolderId === folder.id;

    // Get folder icon and color
    const FolderIcon = FOLDER_ICONS[folder.type] || Folder;
    const folderColors = FOLDER_COLORS[folder.type] || FOLDER_COLORS.GENERAL;

    // Handle folder selection
    const handleSelect = () => {
        if (onSelect) onSelect(folder);
    };

    // Handle expand/collapse
    const handleToggle = (e) => {
        e.stopPropagation();
        if (onToggle) onToggle(folder.id);
    };

    // Handle context menu
    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowContextMenu(!showContextMenu);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
        } else if (e.key === 'Escape' && showContextMenu) {
            setShowContextMenu(false);
        }
    };

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setShowContextMenu(false);
            }
        };

        if (showContextMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showContextMenu]);

    // Handle drag operations
    const handleDragStart = (e) => {
        e.dataTransfer.setData('text/plain', folder.id.toString());
        if (onDragStart) onDragStart(folder.id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        if (draggedFolderId && draggedFolderId !== folder.id) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
        if (onDrop && draggedId !== folder.id) {
            onDrop(draggedId, folder.id);
        }
    };

    const handleDragEnd = () => {
        setIsDragOver(false);
        if (onDragEnd) onDragEnd();
    };

    return (
        <div className={className}>
            {/* Folder Item */}
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: level * 0.05 }}
                className={`
          group flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200
          ${isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
          ${isDragging ? 'opacity-50' : ''}
          ${isDragOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300' : ''}
        `}
                style={{ paddingLeft: `${level * 20 + 8}px` }}
                onClick={handleSelect}
                onContextMenu={handleContextMenu}
                onKeyDown={handleKeyDown}
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                tabIndex={0}
                role="button"
                aria-label={`Folder: ${folder.name}${folder.description ? ` - ${folder.description}` : ''}`}
            >
                {/* Expand/Collapse Button */}
                <div className="flex items-center space-x-2">
                    {hasChildren ? (
                        <Button
                            variant="ghost"
                            size="xs"
                            onClick={handleToggle}
                            className="w-5 h-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            {isExpanded ? (
                                <ChevronDown className="w-3 h-3" />
                            ) : (
                                <ChevronRight className="w-3 h-3" />
                            )}
                        </Button>
                    ) : (
                        <div className="w-5 h-5" />
                    )}

                    {/* Folder Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${folderColors}`}>
                        <FolderIcon className="w-4 h-4" />
                    </div>

                    {/* Folder Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                                {folder.name}
                            </span>

                            {/* Privacy Indicator */}
                            {!folder.isPublic && (
                                <Lock className="w-3 h-3 text-gray-400" />
                            )}

                            {/* Document Count */}
                            {folder.documentCount > 0 && (
                                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                    {folder.documentCount}
                                </span>
                            )}
                        </div>

                        {folder.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {folder.description}
                            </p>
                        )}
                    </div>

                    {/* Context Menu Button */}
                    <div className="relative group/context">
                        <Button
                            variant={showContextMenu ? "default" : "ghost"}
                            size="xs"
                            onClick={handleContextMenu}
                            className={`w-6 h-6 p-0 transition-all duration-200 ${showContextMenu
                                ? 'opacity-100 bg-blue-100 dark:bg-blue-900/30'
                                : 'opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            title="More options (click for menu)"
                        >
                            <MoreVertical className={`w-3 h-3 ${showContextMenu ? 'text-blue-600' : ''}`} />
                        </Button>

                        {/* Tooltip */}
                        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover/context:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            More options
                            <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                        </div>
                    </div>

                    {/* Context Menu */}
                    <AnimatePresence>
                        {showContextMenu && (
                            <motion.div
                                ref={contextMenuRef}
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="fixed w-64 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 rounded-xl shadow-2xl z-[99999] min-w-max"
                                style={{
                                    // Use fixed positioning to avoid container overflow issues
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    maxHeight: '90vh',
                                    overflowY: 'auto'
                                }}
                                onMouseLeave={() => {
                                    setTimeout(() => setShowContextMenu(false), 200);
                                }}
                            >
                                {/* Enhanced Header with Folder Info */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 rounded-t-xl border-b border-blue-200 dark:border-blue-700">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${folderColors}`}>
                                            <FolderIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                                {folder.name}
                                            </div>
                                            {folder.description && (
                                                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                                    {folder.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Folder Type Badge */}
                                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                                        {folder.type || 'GENERAL'} Folder
                                    </div>
                                </div>

                                {/* Action Buttons with Enhanced Styling */}
                                <div className="p-3 space-y-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAddSubfolder && onAddSubfolder(folder);
                                            setShowContextMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-3 transition-all duration-200 rounded-lg border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <FolderPlus className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <div>Add Subfolder</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Create a new folder inside this one</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit && onEdit(folder);
                                            setShowContextMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300 flex items-center space-x-3 transition-all duration-200 rounded-lg border border-transparent hover:border-green-200 dark:hover:border-green-700"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <Edit className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <div>Rename</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Change folder name and description</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onMove && onMove(folder);
                                            setShowContextMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 flex items-center space-x-3 transition-all duration-200 rounded-lg border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Move className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <div>Move</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Move to different location</div>
                                        </div>
                                    </button>

                                    <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete && onDelete(folder);
                                            setShowContextMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 flex items-center space-x-3 transition-all duration-200 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-700"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                            <div>Delete</div>
                                            <div className="text-xs text-red-500 dark:text-red-400">Permanently remove this folder</div>
                                        </div>
                                    </button>
                                </div>

                                {/* Close Button */}
                                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => setShowContextMenu(false)}
                                        className="w-full px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Children */}
            <AnimatePresence>
                {hasChildren && isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        {folder.children.map((child) => (
                            <FolderTreeItem
                                key={child.id}
                                folder={child}
                                level={level + 1}
                                isExpanded={isExpanded}
                                onToggle={onToggle}
                                onSelect={onSelect}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onMove={onMove}
                                onAddSubfolder={onAddSubfolder}
                                selectedFolderId={selectedFolderId}
                                draggedFolderId={draggedFolderId}
                                onDragStart={onDragStart}
                                onDragOver={onDragOver}
                                onDrop={onDrop}
                                onDragEnd={onDragEnd}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FolderTreeView = ({
    folders = [],
    selectedFolderId,
    onFolderSelect,
    onFolderEdit,
    onFolderDelete,
    onFolderMove,
    onAddFolder,
    onAddSubfolder,
    loading = false,
    className = '',
    ...props
}) => {
    // State for expanded folders
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [draggedFolderId, setDraggedFolderId] = useState(null);

    // Toggle folder expansion
    const handleToggle = useCallback((folderId) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        });
    }, []);

    // Handle drag operations
    const handleDragStart = useCallback((folderId) => {
        setDraggedFolderId(folderId);
    }, []);

    const handleDrop = useCallback((draggedId, targetId) => {
        if (onFolderMove) {
            onFolderMove(draggedId, targetId);
        }
        setDraggedFolderId(null);
    }, [onFolderMove]);

    const handleDragEnd = useCallback(() => {
        setDraggedFolderId(null);
    }, []);

    // Expand all folders
    const expandAll = () => {
        const allFolderIds = new Set();
        const collectIds = (folderList) => {
            folderList.forEach(folder => {
                allFolderIds.add(folder.id);
                if (folder.children) {
                    collectIds(folder.children);
                }
            });
        };
        collectIds(folders);
        setExpandedFolders(allFolderIds);
    };

    // Collapse all folders
    const collapseAll = () => {
        setExpandedFolders(new Set());
    };

    // No need to filter props since they're already destructured in function signature

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <Folder className="w-5 h-5" />
                        <span>Folder Structure</span>
                    </CardTitle>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={expandAll}
                            className="text-xs"
                        >
                            Expand All
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={collapseAll}
                            className="text-xs"
                        >
                            Collapse All
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddFolder && onAddFolder()}
                            className="flex items-center space-x-1"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Folder</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-500">Loading folders...</span>
                    </div>
                ) : folders.length > 0 ? (
                    <div className="space-y-1">
                        {folders.map((folder) => (
                            <FolderTreeItem
                                key={folder.id}
                                folder={folder}
                                level={0}
                                isExpanded={expandedFolders.has(folder.id)}
                                onToggle={handleToggle}
                                onSelect={onFolderSelect}
                                onEdit={onFolderEdit}
                                onDelete={onFolderDelete}
                                onMove={onFolderMove}
                                onAddSubfolder={onAddSubfolder}
                                selectedFolderId={selectedFolderId}
                                draggedFolderId={draggedFolderId}
                                onDragStart={handleDragStart}
                                onDrop={handleDrop}
                                onDragEnd={handleDragEnd}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Folder className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400 mb-3">
                            No folders created yet
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            Use the "New Folder" button above to create your first folder
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FolderTreeView;





