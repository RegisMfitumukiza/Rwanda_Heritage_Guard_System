import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createFullQuiz } from '../../services/api/educationApi';

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
    HelpCircle,
    Save,
    ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { categories, difficultyLevels, getCategoryDisplayName, getDifficultyDisplayName } from './educationConstants';

// Quiz schema with improved validation
const quizSchema = z.object({
    titleEn: z.string().min(1, 'English title is required').trim(),
    titleRw: z.string().optional(),
    titleFr: z.string().optional(),
    descriptionEn: z.string().min(10, 'English description must be at least 10 characters').trim(),
    descriptionRw: z.string().optional(),
    descriptionFr: z.string().optional(),
    articleId: z.number().min(1, 'Article ID is required'),
    category: z.string().min(1, 'Category is required'),
    difficultyLevel: z.string().min(1, 'Difficulty level is required'),
    passingScorePercentage: z.number().min(1).max(100).default(70),
    timeLimitMinutes: z.number().min(1).max(480).default(30),
    maxAttempts: z.number().min(1).max(10).default(3),
    tags: z.string().optional(),
    isPublic: z.boolean().default(true),
    featuredImage: z.string().optional(),
    youtubeVideoUrl: z.string().optional(),
    relatedArtifactId: z.union([z.number().positive(), z.undefined(), z.null(), z.string().length(0)]).optional(),
    relatedHeritageSiteId: z.union([z.number().positive(), z.undefined(), z.null(), z.string().length(0)]).optional()
});

const QuizInformationForm = ({ articles, onSubmit, isSubmitting }) => {
    const navigate = useNavigate();

    // Form hook with improved configuration
    const quizForm = useForm({
        resolver: zodResolver(quizSchema),
        defaultValues: {
            titleEn: '',
            titleRw: '',
            titleFr: '',
            descriptionEn: '',
            descriptionRw: '',
            descriptionFr: '',
            articleId: undefined,
            category: '',
            difficultyLevel: '',
            passingScorePercentage: 70,
            timeLimitMinutes: 30,
            maxAttempts: 3,
            tags: '',
            isPublic: true,
            featuredImage: '',
            youtubeVideoUrl: '',
            relatedArtifactId: null,
            relatedHeritageSiteId: null
        },
        mode: 'onBlur', // Validate on blur for better UX
        reValidateMode: 'onChange' // Re-validate when values change
    });

    // Debug form values for troubleshooting
    useEffect(() => {
        const subscription = quizForm.watch((value, { name, type }) => {
            if (name === 'descriptionEn') {
                console.log('Description EN changed:', value.descriptionEn, 'Length:', value.descriptionEn?.length);
            }
        });
        return () => subscription.unsubscribe();
    }, [quizForm.watch]);

    // Additional debugging for form state
    useEffect(() => {
        const interval = setInterval(() => {
            const currentValues = quizForm.getValues();
            const currentErrors = quizForm.formState.errors;
            console.log('Form state check:', {
                descriptionEn: currentValues.descriptionEn,
                descriptionEnLength: currentValues.descriptionEn?.length,
                hasErrors: Object.keys(currentErrors).length > 0,
                errors: currentErrors
            });
        }, 2000); // Check every 2 seconds

        return () => clearInterval(interval);
    }, [quizForm]);

    const handleQuizSubmit = async (data) => {
        try {
            console.log('Form submission data:', data);
            console.log('Description EN value:', data.descriptionEn);
            console.log('Description EN length:', data.descriptionEn?.length);

            // Check if we have questions
            if (!onSubmit) {
                toast.error('Please add at least one question to the quiz');
                return;
            }

            // Trigger validation manually to ensure all errors are shown
            const isValid = await quizForm.trigger();
            if (!isValid) {
                console.log('Form validation failed:', quizForm.formState.errors);
                toast.error('Please fix all validation errors before submitting');
                return;
            }

            // Validate required fields manually as a safety check
            if (!data.descriptionEn || data.descriptionEn.trim().length < 10) {
                toast.error('English description must be at least 10 characters long');
                return;
            }

            // Prepare quiz data - only send what backend expects
            const quizData = {
                titleEn: data.titleEn?.trim() || '',
                titleRw: data.titleRw?.trim() || '',
                titleFr: data.titleFr?.trim() || '',
                descriptionEn: data.descriptionEn?.trim() || '',
                descriptionRw: data.descriptionRw?.trim() || '',
                descriptionFr: data.descriptionFr?.trim() || '',
                articleId: data.articleId,
                category: data.category,
                difficultyLevel: data.difficultyLevel,
                passingScorePercentage: data.passingScorePercentage,
                timeLimitMinutes: data.timeLimitMinutes,
                maxAttempts: data.maxAttempts,
                tags: data.tags?.trim() || '',
                isPublic: data.isPublic,
                isActive: true,
                relatedArtifactId: data.relatedArtifactId,
                relatedHeritageSiteId: data.relatedHeritageSiteId
            };

            console.log('Prepared quiz data:', quizData);

            // Call the parent onSubmit function
            onSubmit(quizData);
        } catch (error) {
            console.error('Error preparing quiz data:', error);
            toast.error('Failed to prepare quiz data. Please try again.');
        }
    };

    // Handle form errors
    const handleFormError = (errors) => {
        console.log('Form validation errors:', errors);

        // Show specific error messages
        if (errors.descriptionEn) {
            toast.error(errors.descriptionEn.message);
        }
        if (errors.titleEn) {
            toast.error(errors.titleEn.message);
        }
        if (errors.articleId) {
            toast.error(errors.articleId.message);
        }
        if (errors.category) {
            toast.error(errors.category.message);
        }
        if (errors.difficultyLevel) {
            toast.error(errors.difficultyLevel.message);
        }
    };

    return (
        <MobileCard>
            <MobileCardHeader>
                <MobileCardTitle icon={HelpCircle}>Quiz Information</MobileCardTitle>
            </MobileCardHeader>
            <MobileCardContent>
                <form onSubmit={quizForm.handleSubmit(handleQuizSubmit, handleFormError)} className="space-y-6">
                    {/* Title Section */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Title *</Label>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <FormGroup>
                                <Label htmlFor="quiz-titleEn">English *</Label>
                                <Input
                                    id="quiz-titleEn"
                                    placeholder="Enter quiz title in English"
                                    {...quizForm.register('titleEn')}
                                    className="w-full"
                                    aria-describedby="titleEn-error"
                                />
                                {quizForm.formState.errors.titleEn && (
                                    <span id="titleEn-error" className="text-red-500 text-sm">
                                        {quizForm.formState.errors.titleEn.message}
                                    </span>
                                )}
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="quiz-titleRw">Kinyarwanda</Label>
                                <Input
                                    id="quiz-titleRw"
                                    placeholder="Enter quiz title in Kinyarwanda"
                                    {...quizForm.register('titleRw')}
                                    className="w-full"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="quiz-titleFr">French</Label>
                                <Input
                                    id="quiz-titleFr"
                                    placeholder="Enter quiz title in French"
                                    {...quizForm.register('titleFr')}
                                    className="w-full"
                                />
                            </FormGroup>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Description *</Label>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <FormGroup>
                                <Label htmlFor="quiz-descriptionEn">English *</Label>
                                <textarea
                                    id="quiz-descriptionEn"
                                    placeholder="Describe what this quiz covers (minimum 10 characters)"
                                    rows={4}
                                    {...quizForm.register('descriptionEn')}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white ${quizForm.formState.errors.descriptionEn ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    aria-describedby="descriptionEn-error"
                                />
                                {quizForm.formState.errors.descriptionEn && (
                                    <span id="descriptionEn-error" className="text-sm text-red-500">
                                        {quizForm.formState.errors.descriptionEn.message}
                                    </span>
                                )}
                                <p className="text-sm text-gray-500 mt-1">
                                    Current length: {quizForm.watch('descriptionEn')?.length || 0} characters
                                </p>
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="quiz-descriptionRw">Kinyarwanda</Label>
                                <textarea
                                    id="quiz-descriptionRw"
                                    placeholder="Describe what this quiz covers in Kinyarwanda"
                                    rows={4}
                                    {...quizForm.register('descriptionRw')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label htmlFor="quiz-descriptionFr">French</Label>
                                <textarea
                                    id="quiz-descriptionFr"
                                    placeholder="Describe what this quiz covers in French"
                                    rows={4}
                                    {...quizForm.register('descriptionFr')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </FormGroup>
                        </div>
                    </div>

                    {/* Quiz Settings with Improved Layout - Related Article and Category in separate rows */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormGroup>
                                <Label htmlFor="quiz-articleId">Related Article *</Label>
                                <select
                                    id="quiz-articleId"
                                    {...quizForm.register('articleId', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required
                                >
                                    <option value="">Select an article</option>
                                    {articles.map(article => (
                                        <option key={article.id} value={article.id}>
                                            {article.titleEn || article.title}
                                        </option>
                                    ))}
                                </select>
                                {quizForm.formState.errors.articleId && (
                                    <span className="text-sm text-red-500">{quizForm.formState.errors.articleId.message}</span>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <Label>Category *</Label>
                                <select
                                    {...quizForm.register('category')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>
                                            {getCategoryDisplayName(cat)}
                                        </option>
                                    ))}
                                </select>
                                {quizForm.formState.errors.category && (
                                    <span className="text-sm text-red-500">{quizForm.formState.errors.category.message}</span>
                                )}
                            </FormGroup>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormGroup>
                                <Label>Difficulty Level *</Label>
                                <select
                                    {...quizForm.register('difficultyLevel')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="">Select difficulty level</option>
                                    {difficultyLevels.map(level => (
                                        <option key={level} value={level}>
                                            {getDifficultyDisplayName(level)}
                                        </option>
                                    ))}
                                </select>
                                {quizForm.formState.errors.difficultyLevel && (
                                    <span className="text-sm text-red-500">{quizForm.formState.errors.difficultyLevel.message}</span>
                                )}
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="quiz-tags">Tags</Label>
                                <Input
                                    id="quiz-tags"
                                    placeholder="Enter tags separated by commas"
                                    {...quizForm.register('tags')}
                                    className="w-full"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Tags help users find your quiz more easily
                                </p>
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="quiz-passingScorePercentage">Passing Score (%) *</Label>
                                <Input
                                    id="quiz-passingScorePercentage"
                                    type="number"
                                    min="1"
                                    max="100"
                                    placeholder="70"
                                    {...quizForm.register('passingScorePercentage', { valueAsNumber: true })}
                                    className="w-full"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Minimum score required to pass the quiz
                                </p>
                            </FormGroup>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormGroup>
                                <Label htmlFor="quiz-timeLimitMinutes">Time Limit (minutes) *</Label>
                                <Input
                                    id="quiz-timeLimitMinutes"
                                    type="number"
                                    min="1"
                                    max="480"
                                    placeholder="30"
                                    {...quizForm.register('timeLimitMinutes', { valueAsNumber: true })}
                                    className="w-full"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Maximum time allowed to complete the quiz
                                </p>
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="quiz-maxAttempts">Max Attempts *</Label>
                                <Input
                                    id="quiz-maxAttempts"
                                    type="number"
                                    min="1"
                                    max="10"
                                    placeholder="3"
                                    {...quizForm.register('maxAttempts', { valueAsNumber: true })}
                                    className="w-full"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Maximum number of attempts allowed
                                </p>
                            </FormGroup>
                        </div>
                    </div>

                    {/* Enhanced Content Fields */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            Enhanced Content Options
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormGroup>
                                <Label htmlFor="quiz-relatedArtifactId">Related Artifact ID</Label>
                                <Input
                                    id="quiz-relatedArtifactId"
                                    type="number"
                                    placeholder="123"
                                    value={quizForm.watch('relatedArtifactId') || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || value === null || value === undefined) {
                                            quizForm.setValue('relatedArtifactId', null);
                                        } else {
                                            const num = Number(value);
                                            if (!isNaN(num) && num > 0) {
                                                quizForm.setValue('relatedArtifactId', num);
                                            } else {
                                                quizForm.setValue('relatedArtifactId', null);
                                            }
                                        }
                                    }}
                                    className="w-full"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Optional: Link to a related artifact
                                </p>
                            </FormGroup>

                            <FormGroup>
                                <Label htmlFor="quiz-relatedHeritageSiteId">Related Heritage Site ID</Label>
                                <Input
                                    id="quiz-relatedHeritageSiteId"
                                    type="number"
                                    placeholder="456"
                                    value={quizForm.watch('relatedHeritageSiteId') || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || value === null || value === undefined) {
                                            quizForm.setValue('relatedHeritageSiteId', null);
                                        } else {
                                            const num = Number(value);
                                            if (!isNaN(num) && num > 0) {
                                                quizForm.setValue('relatedHeritageSiteId', num);
                                            } else {
                                                quizForm.setValue('relatedHeritageSiteId', null);
                                            }
                                        }
                                    }}
                                    className="w-full"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Optional: Link to a related heritage site
                                </p>
                            </FormGroup>
                        </div>
                    </div>

                    {/* Public/Private Toggle */}
                    <FormGroup>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="quiz-isPublic"
                                {...quizForm.register('isPublic')}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor="quiz-isPublic">Make this quiz public</Label>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Public quizzes are visible to all users, private ones require authentication
                        </p>
                    </FormGroup>

                    {/* Quiz Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                        <MobileButton
                            variant="outline"
                            onClick={() => navigate('/dashboard/education/quizzes')}
                            className="sm:mr-auto"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Quizzes
                        </MobileButton>



                        <MobileButton
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSubmitting ? 'Creating...' : 'Create Quiz'}
                        </MobileButton>
                    </div>
                </form>
            </MobileCardContent>
        </MobileCard>
    );
};

export default QuizInformationForm;
