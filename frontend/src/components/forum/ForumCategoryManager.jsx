import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useGet, usePost } from '../../hooks/useSimpleApi';

const ForumCategoryManager = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPublic: true
    });

    const { data: categories, loading, refetch } = useGet('/api/forum/categories', {}, {
        onSuccess: (data) => console.log('Forum categories loaded:', data),
        onError: (error) => console.error('Failed to load forum categories:', error)
    });

    const createCategory = usePost('/api/forum/categories', {
        onSuccess: (data) => {
            console.log('Forum category created:', data);
            refetch();
        },
        onError: (error) => console.error('Failed to create forum category:', error)
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCategory.execute(formData);
            setFormData({ name: '', description: '', isPublic: true });
            setShowCreateForm(false);
            setEditingCategory(null);
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description,
            isPublic: category.isPublic
        });
        setShowCreateForm(true);
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', isPublic: true });
        setShowCreateForm(false);
        setEditingCategory(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Forum Categories
                </h2>
                <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                </Button>
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {editingCategory ? 'Edit Category' : 'Create New Category'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category Name
                            </label>
                            <Input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter category name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter category description"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                rows={3}
                                required
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={formData.isPublic}
                                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                                Public Category
                            </label>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={resetForm}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createCategory.loading}>
                                {createCategory.loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories?.content?.map((category) => (
                    <Card key={category.id} className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {category.name}
                                    </h3>
                                    {category.isPublic ? (
                                        <Eye className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <EyeOff className="w-4 h-4 text-yellow-600" />
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                    {category.description}
                                </p>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Created by {category.createdBy} on {new Date(category.createdDate).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(category)}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {categories?.content?.length === 0 && (
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                        <Plus className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No categories yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Create your first forum category to get started
                    </p>
                    <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Category
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ForumCategoryManager;


