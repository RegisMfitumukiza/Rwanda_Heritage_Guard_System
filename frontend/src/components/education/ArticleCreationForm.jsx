import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { createArticle } from '../../services/api/educationApi';

import {
    MobileCard,
    MobileCardHeader,
    MobileCardTitle,
    MobileCardContent,
    MobileButton,
    FormGroup,
    Label,
    Input,
    TextArea
} from '../ui';
import {
    BookOpen,
    Save,
    ArrowLeft,
    Trash2,
    Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { categories, difficultyLevels, getCategoryDisplayName, getDifficultyDisplayName } from './educationConstants';

const ArticleCreationForm = ({ isEditMode = false, editingArticle = null, onSuccess }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Simplified form without complex validation
    const articleForm = useForm({
        defaultValues: {
            titleEn: editingArticle?.titleEn || '',
            titleRw: editingArticle?.titleRw || '',
            titleFr: editingArticle?.titleFr || '',
            contentEn: editingArticle?.contentEn || '',
            contentRw: editingArticle?.contentRw || '',
            contentFr: editingArticle?.contentFr || '',
            summaryEn: editingArticle?.summaryEn || '',
            summaryRw: editingArticle?.summaryRw || '',
            summaryFr: editingArticle?.summaryFr || '',
            category: editingArticle?.category || '',
            difficultyLevel: editingArticle?.difficultyLevel || '',
            estimatedReadTimeMinutes: editingArticle?.estimatedReadTimeMinutes || 15,
            tags: editingArticle?.tags || [],
            isPublic: editingArticle?.isPublic !== undefined ? editingArticle.isPublic : true,
            isActive: editingArticle?.isActive !== undefined ? editingArticle.isActive : true,
            featuredImage: editingArticle?.featuredImage || '',
            youtubeVideoUrl: editingArticle?.youtubeVideoUrl || '',
            relatedArtifactId: editingArticle?.relatedArtifactId || '',
            relatedHeritageSiteId: editingArticle?.relatedHeritageSiteId || ''
        }
    });

    // Field arrays
    const { fields: tagFields, append: appendTag, remove: removeTagField } = useFieldArray({
        control: articleForm.control,
        name: 'tags'
    });

    // Update form when editingArticle changes
    useEffect(() => {
        if (editingArticle && isEditMode) {
            console.log('🔍 DEBUG: Loading existing article data into form');
            console.log('🔍 DEBUG: Original article data:', editingArticle);
            console.log('🔍 DEBUG: Content lengths in original data:', {
                titleEn: editingArticle.titleEn?.length || 0,
                contentEn: editingArticle.contentEn?.length || 0,
                summaryEn: editingArticle.summaryEn?.length || 0,
                contentRw: editingArticle.contentRw?.length || 0,
                contentFr: editingArticle.contentFr?.length || 0
            });

            articleForm.reset({
                titleEn: editingArticle.titleEn || '',
                titleRw: editingArticle.titleRw || '',
                titleFr: editingArticle.titleFr || '',
                contentEn: editingArticle.contentEn || '',
                contentRw: editingArticle.contentRw || '',
                contentFr: editingArticle.contentFr || '',
                summaryEn: editingArticle.summaryEn || '',
                summaryRw: editingArticle.summaryRw || '',
                summaryFr: editingArticle.summaryFr || '',
                category: editingArticle.category || '',
                difficultyLevel: editingArticle.difficultyLevel || '',
                estimatedReadTimeMinutes: editingArticle.estimatedReadTimeMinutes || 15,
                tags: editingArticle.tags || [],
                isPublic: editingArticle.isPublic ?? true,
                isActive: editingArticle.isActive ?? true,
                featuredImage: editingArticle.featuredImage || '',
                youtubeVideoUrl: editingArticle.youtubeVideoUrl || '',
                relatedArtifactId: editingArticle.relatedArtifactId || '',
                relatedHeritageSiteId: editingArticle.relatedHeritageSiteId || ''
            });

            console.log('🔍 DEBUG: Form reset completed');
            console.log('🔍 DEBUG: Form values after reset:', articleForm.getValues());
        }
    }, [editingArticle, isEditMode, articleForm]);

    // SIMPLE FORM SUBMIT HANDLER - Bypass all validation issues
    const handleFormSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('=== FORM SUBMISSION STARTED ===');

        // Get form data directly
        const formData = articleForm.getValues();
        console.log('Form data:', formData);

        // DEBUG: Check content lengths
        console.log('🔍 DEBUG: Content lengths:', {
            titleEn: formData.titleEn?.length || 0,
            contentEn: formData.contentEn?.length || 0,
            summaryEn: formData.summaryEn?.length || 0
        });

        // Simple validation without schema
        const errors = [];
        if (!formData.titleEn || formData.titleEn.trim() === '') errors.push('Title in English is required');
        if (!formData.contentEn || formData.contentEn.trim() === '') errors.push('Content in English is required');
        if (!formData.summaryEn || formData.summaryEn.trim() === '') errors.push('Summary is required');
        if (!formData.category || formData.category === '') errors.push('Category is required');
        if (!formData.difficultyLevel || formData.difficultyLevel === '') errors.push('Difficulty level is required');
        if (!formData.estimatedReadTimeMinutes || formData.estimatedReadTimeMinutes < 1) errors.push('Estimated read time must be at least 1 minute');

        if (errors.length > 0) {
            console.log('Validation errors:', errors);
            toast.error(`Please fix: ${errors.join(', ')}`);
            return;
        }

        console.log('Validation passed, calling API...');

        // Transform data for backend
        const transformedData = {
            titleEn: formData.titleEn.trim(),
            titleRw: formData.titleRw?.trim() || '',
            titleFr: formData.titleFr?.trim() || '',
            contentEn: formData.contentEn.trim(),
            contentRw: formData.contentRw?.trim() || '',
            contentFr: formData.contentFr?.trim() || '',
            summaryEn: formData.summaryEn.trim(),
            summaryRw: formData.summaryRw?.trim() || '',
            summaryFr: formData.summaryFr?.trim() || '',
            category: formData.category,
            difficultyLevel: formData.difficultyLevel,
            estimatedReadTimeMinutes: parseInt(formData.estimatedReadTimeMinutes) || 15,
            tags: formData.tags?.filter(tag => tag && tag.trim() !== '') || [],
            isPublic: formData.isPublic,
            isActive: formData.isActive,
            featuredImage: formData.featuredImage?.trim() || '',
            youtubeVideoUrl: formData.youtubeVideoUrl?.trim() || '',
            // Handle optional fields properly
            relatedArtifactId: formData.relatedArtifactId && formData.relatedArtifactId.toString().trim() !== '' && !isNaN(formData.relatedArtifactId) && parseInt(formData.relatedArtifactId) > 0 ? parseInt(formData.relatedArtifactId) : null,
            relatedHeritageSiteId: formData.relatedHeritageSiteId && formData.relatedHeritageSiteId.toString().trim() !== '' && !isNaN(formData.relatedHeritageSiteId) && parseInt(formData.relatedHeritageSiteId) > 0 ? parseInt(formData.relatedHeritageSiteId) : null
        };

        console.log('Transformed data:', transformedData);

        // DEBUG: Check transformed content lengths
        console.log('🔍 DEBUG: Transformed content lengths:', {
            titleEn: transformedData.titleEn?.length || 0,
            contentEn: transformedData.contentEn?.length || 0,
            summaryEn: transformedData.summaryEn?.length || 0
        });

        // Submit directly without complex validation
        submitArticle(transformedData);
    };

    // Simple submission function
    const submitArticle = async (data) => {
        try {
            setIsSubmitting(true);
            console.log('Making API call...');

            let result;
            if (isEditMode && editingArticle?.id) {
                // Update existing article
                console.log('🔍 DEBUG: Updating article with ID:', editingArticle.id);
                console.log('🔍 DEBUG: Content length being sent:', data.contentEn?.length || 0);

                const { updateArticle } = await import('../../services/api/educationApi');
                result = await updateArticle(editingArticle.id, data);

                console.log('🔍 DEBUG: Update response received');
                console.log('🔍 DEBUG: Response content length:', result?.contentEn?.length || 0);

                // Check for truncation
                if (data.contentEn && result?.contentEn && data.contentEn.length !== result.contentEn.length) {
                    console.warn('⚠️ WARNING: Content truncated! Sent:', data.contentEn.length, 'Received:', result.contentEn.length);
                }

                console.log('Article updated successfully:', result);
                toast.success('Article updated successfully!');
            } else {
                // Create new article
                result = await createArticle(data);
                console.log('Article created successfully:', result);
                toast.success('Article created successfully!');
            }

            // Call onSuccess callback if provided, otherwise navigate
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/dashboard/education/articles');
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} article:`, error);
            toast.error(`Failed to ${isEditMode ? 'update' : 'create'} article: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
            console.log('=== FORM SUBMISSION ENDED ===');
        }
    };

    // Helper functions
    const addTag = () => {
        appendTag('');
    };

    const removeTag = (index) => {
        removeTagField(index);
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <MobileCard>
                <MobileCardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <MobileButton
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/dashboard/education')}
                                className="p-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </MobileButton>
                            <MobileCardTitle className="flex items-center space-x-2">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                                <span>{isEditMode ? 'Edit Article' : 'Create New Article'}</span>
                            </MobileCardTitle>
                        </div>
                    </div>
                </MobileCardHeader>
                <MobileCardContent>
                    <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
                        {/* Title Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Article Titles</h3>

                            <FormGroup>
                                <Label htmlFor="titleEn" className="text-gray-700 dark:text-gray-300">Title (English) *</Label>
                                <Input
                                    id="titleEn"
                                    {...articleForm.register('titleEn')}
                                    placeholder="Enter article title in English"
                                    className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="titleRw" className="text-gray-700 dark:text-gray-300">Title (Kinyarwanda)</Label>
                                <Input
                                    id="titleRw"
                                    {...articleForm.register('titleRw')}
                                    placeholder="Enter article title in Kinyarwanda"
                                    className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="titleFr" className="text-gray-700 dark:text-gray-300">Title (French)</Label>
                                <Input
                                    id="titleFr"
                                    {...articleForm.register('titleFr')}
                                    placeholder="Enter article title in French"
                                    className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                />
                            </FormGroup>
                        </div>

                        {/* Content Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Article Content</h3>

                            <FormGroup>
                                <Label htmlFor="contentEn" className="text-gray-700 dark:text-gray-300">Content (English) *</Label>
                                <TextArea
                                    id="contentEn"
                                    {...articleForm.register('contentEn')}
                                    placeholder="Enter article content in English"
                                    rows={8}
                                    className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="contentRw" className="text-gray-700 dark:text-gray-300">Content (Kinyarwanda)</Label>
                                <TextArea
                                    id="contentRw"
                                    {...articleForm.register('contentRw')}
                                    placeholder="Enter article content in Kinyarwanda"
                                    rows={8}
                                    className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="contentFr" className="text-gray-700 dark:text-gray-300">Content (French)</Label>
                                <TextArea
                                    id="contentFr"
                                    {...articleForm.register('contentFr')}
                                    placeholder="Enter article content in French"
                                    rows={8}
                                    className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                />
                            </FormGroup>
                        </div>

                        {/* Summary Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Article Summary</h3>

                            <FormGroup>
                                <Label htmlFor="summaryEn" className="text-gray-700 dark:text-gray-300">Summary (English) *</Label>
                                <TextArea
                                    id="summaryEn"
                                    {...articleForm.register('summaryEn')}
                                    placeholder="Enter article summary in English"
                                    rows={4}
                                    className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="summaryRw" className="text-gray-700 dark:text-gray-300">Summary (Kinyarwanda)</Label>
                                <TextArea
                                    id="summaryRw"
                                    {...articleForm.register('summaryRw')}
                                    placeholder="Enter article summary in Kinyarwanda"
                                    rows={4}
                                    className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="summaryFr" className="text-gray-700 dark:text-gray-300">Summary (French)</Label>
                                <TextArea
                                    id="summaryFr"
                                    {...articleForm.register('summaryFr')}
                                    placeholder="Enter article summary in French"
                                    rows={4}
                                    className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                />
                            </FormGroup>
                        </div>

                        {/* Metadata Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Article Metadata</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormGroup>
                                    <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Category *</Label>
                                    <select
                                        id="category"
                                        {...articleForm.register('category')}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {getCategoryDisplayName(category)}
                                            </option>
                                        ))}
                                    </select>
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="difficultyLevel" className="text-gray-700 dark:text-gray-300">Difficulty Level *</Label>
                                    <select
                                        id="difficultyLevel"
                                        {...articleForm.register('difficultyLevel')}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                                    >
                                        <option value="">Select difficulty level</option>
                                        {difficultyLevels.map((level) => (
                                            <option key={level} value={level}>
                                                {getDifficultyDisplayName(level)}
                                            </option>
                                        ))}
                                    </select>
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="estimatedReadTimeMinutes" className="text-gray-700 dark:text-gray-300">Estimated Read Time (minutes) *</Label>
                                    <Input
                                        id="estimatedReadTimeMinutes"
                                        type="number"
                                        {...articleForm.register('estimatedReadTimeMinutes')}
                                        min="1"
                                        max="480"
                                        className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                </FormGroup>
                            </div>
                        </div>

                        {/* Tags Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tags</h3>
                            <div className="space-y-2">
                                {tagFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center space-x-2">
                                        <Input
                                            {...articleForm.register(`tags.${index}`)}
                                            placeholder={`Tag ${index + 1}`}
                                            className="flex-1 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                        />
                                        <MobileButton
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeTag(index)}
                                            className="p-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </MobileButton>
                                    </div>
                                ))}
                                <MobileButton
                                    type="button"
                                    variant="outline"
                                    onClick={addTag}
                                    className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Tag</span>
                                </MobileButton>
                            </div>
                        </div>

                        {/* Optional Fields Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Optional Fields</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormGroup>
                                    <Label htmlFor="relatedArtifactId" className="text-gray-700 dark:text-gray-300">Related Artifact ID</Label>
                                    <Input
                                        id="relatedArtifactId"
                                        type="number"
                                        {...articleForm.register('relatedArtifactId')}
                                        placeholder="Enter related artifact ID (optional)"
                                        className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="relatedHeritageSiteId" className="text-gray-700 dark:text-gray-300">Related Heritage Site ID</Label>
                                    <Input
                                        id="relatedHeritageSiteId"
                                        type="number"
                                        {...articleForm.register('relatedHeritageSiteId')}
                                        placeholder="Enter related heritage site ID (optional)"
                                        className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="featuredImage" className="text-gray-700 dark:text-gray-300">Featured Image URL</Label>
                                    <Input
                                        id="featuredImage"
                                        {...articleForm.register('featuredImage')}
                                        placeholder="Enter featured image URL (optional)"
                                        className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label htmlFor="youtubeVideoUrl" className="text-gray-700 dark:text-gray-300">YouTube Video URL</Label>
                                    <Input
                                        id="youtubeVideoUrl"
                                        {...articleForm.register('youtubeVideoUrl')}
                                        placeholder="Enter YouTube video URL (optional)"
                                        className="w-full text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                </FormGroup>
                            </div>

                            <div className="flex items-center space-x-4">
                                <FormGroup>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isPublic"
                                            {...articleForm.register('isPublic')}
                                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800"
                                        />
                                        <Label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Make article public
                                        </Label>
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            {...articleForm.register('isActive')}
                                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800"
                                        />
                                        <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Activate article
                                        </Label>
                                    </div>
                                </FormGroup>
                            </div>
                        </div>

                        {/* Debug Buttons */}
                        <div className="flex gap-2">
                            <MobileButton
                                type="button"
                                onClick={() => {
                                    const formData = articleForm.getValues();
                                    // Use the same simple validation as the submit handler
                                    const errors = [];
                                    if (!formData.titleEn || formData.titleEn.trim() === '') errors.push('Title in English is required');
                                    if (!formData.contentEn || formData.contentEn.trim() === '') errors.push('Content in English is required');
                                    if (!formData.summaryEn || formData.summaryEn.trim() === '') errors.push('Summary is required');
                                    if (!formData.category || formData.category === '') errors.push('Category is required');
                                    if (!formData.difficultyLevel || formData.difficultyLevel === '') errors.push('Difficulty level is required');
                                    if (!formData.estimatedReadTimeMinutes || formData.estimatedReadTimeMinutes < 1) errors.push('Estimated read time must be at least 1 minute');

                                    console.log('Form validation result:', errors.length === 0 ? 'PASSED' : 'FAILED');
                                    console.log('Validation errors:', errors);
                                    console.log('Form values:', formData);

                                    if (errors.length === 0) {
                                        toast.success('Form validation passed!');
                                    } else {
                                        toast.error(`Validation failed: ${errors.join(', ')}`);
                                    }
                                }}
                                variant="outline"
                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            >
                                🔍 Test Validation
                            </MobileButton>

                            <MobileButton
                                type="button"
                                onClick={async () => {
                                    try {
                                        const formData = articleForm.getValues();
                                        console.log('Testing API with data:', formData);

                                        // Test API call with minimal data
                                        const testData = {
                                            titleEn: formData.titleEn || 'Test Article',
                                            contentEn: formData.contentEn || 'Test content for validation',
                                            summaryEn: formData.summaryEn || 'Test summary',
                                            category: formData.category || 'GENERAL_EDUCATION',
                                            difficultyLevel: formData.difficultyLevel || 'BEGINNER',
                                            estimatedReadTimeMinutes: formData.estimatedReadTimeMinutes || 15,
                                            tags: formData.tags || [],
                                            isPublic: true,
                                            isActive: true
                                        };

                                        console.log('Sending test data to API:', testData);
                                        const result = await createArticle(testData);
                                        console.log('API test result:', result);
                                        toast.success('API test successful!');
                                    } catch (error) {
                                        console.error('API test failed:', error);
                                        toast.error(`API test failed: ${error.message}`);
                                    }
                                }}
                                variant="outline"
                                className="bg-green-500 hover:bg-green-600 text-white"
                            >
                                🧪 Test API
                            </MobileButton>
                        </div>

                        {/* Form Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-4">
                            <MobileButton
                                variant="outline"
                                onClick={() => navigate('/dashboard/education')}
                                className="flex-1"
                            >
                                Cancel
                            </MobileButton>
                            <MobileButton
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Creating...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Save className="h-4 w-4" />
                                        <span>Create Article</span>
                                    </div>
                                )}
                            </MobileButton>
                        </div>
                    </form>
                </MobileCardContent>
            </MobileCard>
        </div>
    );
};

export default ArticleCreationForm;