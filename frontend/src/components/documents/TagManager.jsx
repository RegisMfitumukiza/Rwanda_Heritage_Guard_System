import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tag,
    Plus,
    X,
    Edit,
    Trash2,
    Search,
    Hash,
    TrendingUp,
    Filter,
    Users,
    Clock,
    CheckSquare,
    Square,
    MoreVertical
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { toast } from 'react-hot-toast';

/**
 * TagManager Component
 * 
 * Comprehensive tag management system for document organization:
 * - Tag creation and editing
 * - Tag usage statistics
 * - Tag categories and colors
 * - Bulk tag operations
 * - Tag suggestions and auto-complete
 */

const TagManager = ({
    availableTags = [],
    selectedTags = [],
    onTagsChange,
    onTagCreate,
    onTagEdit,
    onTagDelete,
    showStatistics = true,
    allowCreate = true,
    allowEdit = true,
    maxTags = null,
    className = '',
    ...props
}) => {
    // State management
    const [searchQuery, setSearchQuery] = useState('');
    const [newTagName, setNewTagName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingTag, setEditingTag] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name'); // 'name', 'usage', 'recent'

    // Real tag statistics from API
    const [tagStats, setTagStats] = useState([]);

    // Load tag statistics
    useEffect(() => {
        const loadTagStats = async () => {
            try {
                const response = await fetch('/api/tags/statistics');
                if (response.ok) {
                    const data = await response.json();
                    const statsWithSelection = data.map(tag => ({
                        ...tag,
                        isSelected: selectedTags.includes(tag.name)
                    }));
                    setTagStats(statsWithSelection);
                }
            } catch (error) {
                console.error('Failed to load tag statistics:', error);
                // Fallback to basic stats
                const basicStats = availableTags.map(tag => ({
                    ...tag,
                    usageCount: 0,
                    lastUsed: new Date(),
                    category: tag.category || 'general',
                    isSelected: selectedTags.includes(tag.name)
                }));
                setTagStats(basicStats);
            }
        };

        loadTagStats();
    }, [availableTags, selectedTags]);

    // Tag categories with colors
    const tagCategories = {
        general: { name: 'General', color: 'bg-gray-100 text-gray-800 border-gray-200' },
        heritage: { name: 'Heritage', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        period: { name: 'Time Period', color: 'bg-purple-100 text-purple-800 border-purple-200' },
        material: { name: 'Material', color: 'bg-green-100 text-green-800 border-green-200' },
        location: { name: 'Location', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        condition: { name: 'Condition', color: 'bg-red-100 text-red-800 border-red-200' },
        topic: { name: 'Topic', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
    };

    // Filter and sort tags
    const filteredTags = tagStats.filter(tag => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!tag.name.toLowerCase().includes(query) &&
                !tag.description?.toLowerCase().includes(query)) {
                return false;
            }
        }

        // Category filter
        if (selectedCategory !== 'all' && tag.category !== selectedCategory) {
            return false;
        }

        return true;
    });

    // Sort tags
    const sortedTags = [...filteredTags].sort((a, b) => {
        switch (sortBy) {
            case 'usage':
                return b.usageCount - a.usageCount;
            case 'recent':
                return new Date(b.lastUsed) - new Date(a.lastUsed);
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });

    // Handle tag selection
    const handleTagToggle = (tagName) => {
        const newSelectedTags = selectedTags.includes(tagName)
            ? selectedTags.filter(t => t !== tagName)
            : [...selectedTags, tagName];

        // Check max tags limit
        if (maxTags && !selectedTags.includes(tagName) && newSelectedTags.length > maxTags) {
            toast.error(`Maximum ${maxTags} tags allowed`);
            return;
        }

        if (onTagsChange) {
            onTagsChange(newSelectedTags);
        }
    };

    // Handle tag creation
    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;

        // Check if tag already exists
        if (availableTags.some(tag => tag.name.toLowerCase() === newTagName.trim().toLowerCase())) {
            toast.error('Tag already exists');
            return;
        }

        const newTag = {
            id: Date.now(),
            name: newTagName.trim(),
            category: 'general',
            description: '',
            usageCount: 0,
            createdBy: 'current_user',
            createdDate: new Date().toISOString()
        };

        if (onTagCreate) {
            try {
                await onTagCreate(newTag);
                setNewTagName('');
                setShowCreateForm(false);
                toast.success('Tag created successfully');
            } catch (error) {
                toast.error('Failed to create tag');
            }
        }
    };

    // Handle tag editing
    const handleEditTag = async (tag, updates) => {
        if (onTagEdit) {
            try {
                await onTagEdit(tag.id, updates);
                setEditingTag(null);
                toast.success('Tag updated successfully');
            } catch (error) {
                toast.error('Failed to update tag');
            }
        }
    };

    // Handle tag deletion
    const handleDeleteTag = async (tag) => {
        if (!window.confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
            return;
        }

        if (onTagDelete) {
            try {
                await onTagDelete(tag.id);
                toast.success('Tag deleted successfully');
            } catch (error) {
                toast.error('Failed to delete tag');
            }
        }
    };

    // Select all filtered tags
    const handleSelectAll = () => {
        const allFilteredTagNames = sortedTags.map(tag => tag.name);
        const newSelectedTags = [...new Set([...selectedTags, ...allFilteredTagNames])];

        if (maxTags && newSelectedTags.length > maxTags) {
            toast.error(`Maximum ${maxTags} tags allowed`);
            return;
        }

        if (onTagsChange) {
            onTagsChange(newSelectedTags);
        }
    };

    // Clear all selected tags
    const handleClearAll = () => {
        if (onTagsChange) {
            onTagsChange([]);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    return (
        <Card className={className} {...props}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Tag className="w-5 h-5" />
                        <span>Tag Manager</span>
                        {selectedTags.length > 0 && (
                            <span className="text-sm text-gray-500">
                                ({selectedTags.length} selected)
                            </span>
                        )}
                    </div>

                    {allowCreate && (
                        <Button
                            size="sm"
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center space-x-1"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Tag</span>
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                        <option value="all">All Categories</option>
                        {Object.entries(tagCategories).map(([key, category]) => (
                            <option key={key} value={key}>{category.name}</option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="usage">Sort by Usage</option>
                        <option value="recent">Sort by Recent</option>
                    </select>
                </div>

                {/* Selection Controls */}
                {sortedTags.length > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={handleSelectAll}
                                className="flex items-center space-x-1"
                            >
                                <CheckSquare className="w-3 h-3" />
                                <span>Select All</span>
                            </Button>
                            {selectedTags.length > 0 && (
                                <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={handleClearAll}
                                    className="flex items-center space-x-1"
                                >
                                    <Square className="w-3 h-3" />
                                    <span>Clear All</span>
                                </Button>
                            )}
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {sortedTags.length} tag{sortedTags.length !== 1 ? 's' : ''} found
                        </div>
                    </div>
                )}

                {/* Create Tag Form */}
                <AnimatePresence>
                    {showCreateForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                        >
                            <div className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    placeholder="Tag name..."
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                    autoFocus
                                />
                                <Button
                                    size="sm"
                                    onClick={handleCreateTag}
                                    disabled={!newTagName.trim()}
                                    className="flex items-center space-x-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Create</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setNewTagName('');
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tags List */}
                {sortedTags.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {sortedTags.map((tag, index) => {
                            const categoryConfig = tagCategories[tag.category] || tagCategories.general;

                            return (
                                <motion.div
                                    key={tag.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${tag.isSelected
                                        ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    onClick={() => handleTagToggle(tag.name)}
                                >
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        {/* Selection Checkbox */}
                                        <div className="flex-shrink-0">
                                            {tag.isSelected ? (
                                                <CheckSquare className="w-4 h-4 text-blue-600" />
                                            ) : (
                                                <Square className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>

                                        {/* Tag Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-900 dark:text-white truncate">
                                                    {tag.name}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${categoryConfig.color}`}>
                                                    {tagCategories[tag.category]?.name || 'General'}
                                                </span>
                                            </div>

                                            {showStatistics && (
                                                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    <div className="flex items-center space-x-1">
                                                        <Users className="w-3 h-3" />
                                                        <span>{tag.usageCount} uses</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{formatDate(tag.lastUsed)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {(allowEdit || allowCreate) && (
                                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {allowEdit && (
                                                <Button
                                                    size="xs"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingTag(tag);
                                                    }}
                                                >
                                                    <Edit className="w-3 h-3" />
                                                </Button>
                                            )}

                                            {allowCreate && (
                                                <Button
                                                    size="xs"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTag(tag);
                                                    }}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Hash className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">
                            {searchQuery ? 'No tags match your search' : 'No tags available'}
                        </p>
                        {allowCreate && !searchQuery && (
                            <Button
                                variant="outline"
                                onClick={() => setShowCreateForm(true)}
                                className="mt-3"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create first tag
                            </Button>
                        )}
                    </div>
                )}

                {/* Selected Tags Summary */}
                {selectedTags.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Selected Tags ({selectedTags.length})
                            </span>
                            {maxTags && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {selectedTags.length}/{maxTags}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedTags.map(tagName => {
                                const tag = availableTags.find(t => t.name === tagName) || { name: tagName, category: 'general' };
                                const categoryConfig = tagCategories[tag.category] || tagCategories.general;

                                return (
                                    <div
                                        key={tagName}
                                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${categoryConfig.color}`}
                                    >
                                        <span>{tagName}</span>
                                        <button
                                            onClick={() => handleTagToggle(tagName)}
                                            className="text-current opacity-70 hover:opacity-100"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TagManager;





