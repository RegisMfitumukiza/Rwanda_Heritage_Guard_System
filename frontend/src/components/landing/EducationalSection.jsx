import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronRight,
    Clock,
    Star,
    Award
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGet } from '../../hooks/useSimpleApi';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const EducationalSection = ({
    title,
    subtitle,
    description,
    showEducationalContent = true,
    maxContentItems = 3,
    className = "py-20 bg-white dark:bg-gray-950",
    onContentClick,
    customEducationalContent = null
}) => {
    const navigate = useNavigate();
    const { user, hasPermission } = useAuth();
    const { t } = useLanguage();

    // Use translations for default values
    const defaultTitle = title || t('Educational Title');
    const defaultSubtitle = subtitle || t('Educational Subtitle');
    const defaultDescription = description || t('Educational Description');

    // Fetch real educational articles from API
    const {
        data: articlesData = [],
        loading: articlesLoading,
        error: articlesError
    } = useGet('/api/education/articles', { size: 6, sort: 'createdDate,desc' }, {
        onSuccess: (data) => console.log('Educational articles loaded:', data),
        onError: (error) => console.error('Failed to load educational articles:', error)
    });

    // Fetch real quizzes from API
    const {
        data: quizzesData = [],
        loading: quizzesLoading,
        error: quizzesError
    } = useGet('/api/education/quizzes', { size: 6, sort: 'createdDate,desc' }, {
        onSuccess: (data) => console.log('Educational quizzes loaded:', data),
        onError: (error) => console.error('Failed to load educational quizzes:', error)
    });

    // Transform API data to component format
    const transformArticleData = (article) => {
        return {
            id: article.id,
            title: article.titleEn || article.titleRw || article.titleFr || t('education.untitledArticle'),
            description: article.summaryEn || article.summaryRw || article.summaryFr ||
                (article.contentEn || article.contentRw || article.contentFr || t('education.noContentAvailable')).substring(0, 150) + '...',
            category: article.category || 'Cultural Heritage',
            difficulty: article.difficultyLevel || 'Beginner',
            duration: article.estimatedReadTimeMinutes ? `${article.estimatedReadTimeMinutes} min read` : '15 min read',
            image: article.featuredImage || '/education_placeholder.jpg',
            featured: article.isPublic || false,
            tags: article.tags ? (Array.isArray(article.tags) ? article.tags : article.tags.split(',')) : ['Heritage', 'Culture', 'Education']
        };
    };

    // Fallback educational content if API fails
    const fallbackEducationalContent = [
        {
            id: 1,
            title: 'Traditional Intore Dance',
            description: 'Explore the rich traditions of Intore dance, its cultural significance, and the royal ceremonies where it was performed. Learn about the warrior dance that symbolized strength and unity.',
            category: 'Performing Arts',
            difficulty: 'Beginner',
            duration: '15 min read',
            image: 'intore-dance',
            featured: true,
            tags: ['Dance', 'Royal Ceremonies', 'Warrior Culture']
        },
        {
            id: 2,
            title: 'Imigongo Art: Rwanda\'s Geometric Masterpieces',
            description: 'Discover the unique geometric art form using cow dung, its origins in the royal court, and how this traditional craft continues to thrive in modern Rwanda.',
            category: 'Visual Arts',
            difficulty: 'Intermediate',
            duration: '20 min read',
            image: 'imigongo-art',
            featured: true,
            tags: ['Traditional Art', 'Geometric Patterns', 'Royal Heritage']
        },
        {
            id: 3,
            title: 'Agaseke: The Peace Baskets of Rwanda',
            description: 'Learn about the symbolism and craftsmanship of traditional peace baskets, their role in reconciliation, and the women artisans who preserve this ancient craft.',
            category: 'Crafts & Weaving',
            difficulty: 'Beginner',
            duration: '12 min read',
            image: 'agaseke-baskets',
            featured: true,
            tags: ['Basket Weaving', 'Peace & Reconciliation', 'Women\'s Craft']
        }
    ];

    // Use custom content or API data with fallback
    const educationalContent = customEducationalContent ||
        (articlesData && articlesData.length > 0 ? articlesData.map(transformArticleData) : fallbackEducationalContent);

    // Filter content based on user permissions and preferences
    const getDisplayContent = () => {
        // If using API data, show all available articles
        if (articlesData && articlesData.length > 0) {
            return educationalContent.slice(0, maxContentItems);
        }

        // If using fallback data, show featured first
        const featuredContent = educationalContent.filter(item => item.featured);
        const regularContent = educationalContent.filter(item => !item.featured);
        return [...featuredContent, ...regularContent].slice(0, maxContentItems);
    };

    const displayContent = getDisplayContent();

    const handleContentClick = (content) => {
        if (onContentClick) {
            onContentClick(content);
        } else {
            // Navigate directly to the specific article detail page
            navigate(`/education/article/${content.id}`);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner': return 'bg-blue-100 text-blue-800';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <section className={className}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                {/* <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {defaultTitle}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                        {defaultSubtitle}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        {defaultDescription}
                    </p>
                </motion.div> */}

                {/* Educational Content Section */}
                {showEducationalContent && (
                    <div className="mb-20">
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Featured Educational Content
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Explore authentic articles about Rwanda's cultural heritage
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {articlesLoading ? (
                                // Loading skeleton
                                Array.from({ length: 3 }).map((_, index) => (
                                    <motion.div
                                        key={`educational-skeleton-${index}`}
                                        variants={fadeInUp}
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="hover:shadow-lg transition-shadow h-full">
                                            <div className="p-6 flex flex-col h-full">
                                                <div className="animate-pulse">
                                                    <div className="bg-gray-200 h-4 w-20 rounded mb-4"></div>
                                                    <div className="bg-gray-200 h-6 w-3/4 rounded mb-3"></div>
                                                    <div className="bg-gray-200 h-4 w-full rounded mb-2"></div>
                                                    <div className="bg-gray-200 h-4 w-2/3 rounded mb-4"></div>
                                                    <div className="flex justify-between mb-4">
                                                        <div className="bg-gray-200 h-3 w-16 rounded"></div>
                                                        <div className="bg-gray-200 h-3 w-20 rounded"></div>
                                                    </div>
                                                    <div className="flex gap-1 mb-4">
                                                        <div className="bg-gray-200 h-3 w-12 rounded"></div>
                                                        <div className="bg-gray-200 h-3 w-16 rounded"></div>
                                                    </div>
                                                    <div className="bg-gray-200 h-4 w-24 rounded mt-auto"></div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : articlesError ? (
                                // Error state
                                <motion.div
                                    variants={fadeInUp}
                                    className="col-span-full text-center py-12"
                                >
                                    <div className="text-red-500 text-6xl mb-4">📚</div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        {t('education.unableToLoadContent')}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {t('education.noContentAvailableMessage')}
                                    </p>
                                    <Button
                                        onClick={() => window.location.reload()}
                                        variant="outline"
                                        className="hover:bg-blue-50"
                                    >
                                        {t('education.tryAgain')}
                                    </Button>
                                </motion.div>
                            ) : displayContent.length === 0 ? (
                                // Empty state
                                <motion.div
                                    variants={fadeInUp}
                                    className="col-span-full text-center py-12"
                                >
                                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        {t('education.noContentAvailableEmpty')}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {t('education.noContentAvailableEmptyMessage')}
                                    </p>
                                </motion.div>
                            ) : (
                                displayContent.map((content, index) => (
                                    <motion.div
                                        key={content.id}
                                        variants={fadeInUp}
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="hover:shadow-lg transition-shadow h-full cursor-pointer group">
                                            <div className="p-6 flex flex-col h-full">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                        {content.category}
                                                    </span>
                                                    {content.featured && (
                                                        <Star className="text-yellow-500" size={16} />
                                                    )}
                                                </div>

                                                <h3 className="font-semibold text-xl mb-3 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                                                    {content.title}
                                                </h3>

                                                <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                                                    {content.description}
                                                </p>

                                                <div className="flex items-center justify-between mb-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(content.difficulty)}`}>
                                                        {content.difficulty}
                                                    </span>
                                                    <span className="flex items-center text-gray-500 text-sm">
                                                        <Clock size={14} className="mr-1" />
                                                        {content.duration}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {content.tags.slice(0, 2).map((tag, tagIndex) => (
                                                        <span key={tagIndex} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                <Button
                                                    variant="link"
                                                    className="text-blue-600 hover:text-blue-700 p-0 mt-auto"
                                                    onClick={() => handleContentClick(content)}
                                                >
                                                    {t('education.readArticle')} <ChevronRight size={16} className="ml-1" />
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>

                        <motion.div
                            className="text-center mt-10"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Link to="/education/articles">
                                <Button variant="default" size="lg">
                                    View All Educational Articles
                                    <ChevronRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                )}

            </div>
        </section>
    );
};

export default EducationalSection; 