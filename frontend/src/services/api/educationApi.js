import httpClient from './httpClient';

/**
 * Education API Service
 * Comprehensive service for educational content management including articles, quizzes, and learning progress
 * Leverages the robust httpClient service for consistent error handling and automatic caching
 */

// API Endpoints
const ENDPOINTS = {
    // Educational Articles endpoints
    ARTICLES: '/api/education/articles',
    ARTICLE_BY_ID: '/api/education/articles/{id}',
    ARTICLE_PUBLIC: '/api/education/articles/public',
    ARTICLE_CATEGORY: '/api/education/articles/category/{category}',
    ARTICLE_DIFFICULTY: '/api/education/articles/difficulty/{difficulty}',
    ARTICLE_SEARCH: '/api/education/articles/search',
    ARTICLE_LANGUAGE: '/api/education/articles/{id}/language/{language}',
    ARTICLE_LANGUAGE_LIST: '/api/education/articles/language/{language}',

    // Quizzes endpoints
    QUIZZES: '/api/education/quizzes',
    QUIZ_BY_ID: '/api/education/quizzes/{id}',
    QUIZ_FULL: '/api/education/quizzes/full',
    QUIZ_PUBLIC: '/api/education/quizzes/public',
    QUIZ_SEARCH: '/api/education/quizzes/search',
    QUIZ_TAGS: '/api/education/quizzes/tags/{tag}',
    QUIZ_WITH_TAGS: '/api/education/quizzes/with-tags',
    QUIZ_BY_ARTICLE: '/api/education/quizzes/article/{articleId}',
    QUIZ_LANGUAGE: '/api/education/quizzes/{id}/language/{language}',
    QUIZ_LANGUAGE_LIST: '/api/education/quizzes/language/{language}',

    // Quiz Management endpoints
    QUIZ_START: '/api/education/quizzes/{quizId}/attempt',
    QUIZ_SUBMIT: '/api/education/quizzes/attempt/{attemptId}/submit',
    QUIZ_ATTEMPTS: '/api/education/quizzes/user/{userId}/attempts',
    QUIZ_ATTEMPT_BY_ID: '/api/education/quizzes/attempt/{attemptId}',

    // Learning Progress endpoints
    LEARNING_PROGRESS: '/api/education/progress',
    PROGRESS_BY_USER: '/api/education/progress/user/{userId}',
    PROGRESS_BY_ARTICLE: '/api/education/progress/article/{articleId}',
    PROGRESS_BY_QUIZ: '/api/education/progress/quiz/{quizId}',
    PROGRESS_STATISTICS: '/api/education/progress/statistics',
    PROGRESS_RECENT_ACTIVITY: '/api/education/progress/recent-activity',
    PROGRESS_ACHIEVEMENTS: '/api/education/progress/achievements',
    PROGRESS_QUIZ_HISTORY: '/api/education/progress/quiz-history',

    // Categories and Difficulty Levels
    CATEGORIES: '/api/education/categories',
    DIFFICULTY_LEVELS: '/api/education/difficulty-levels',
};

/**
 * Educational Article Data Structure
 * @typedef {Object} EducationalArticle
 * @property {number} id - Unique identifier
 * @property {string} titleEn - English title
 * @property {string} titleRw - Kinyarwanda title
 * @property {string} titleFr - French title
 * @property {string} contentEn - English content
 * @property {string} contentRw - Kinyarwanda content
 * @property {string} contentFr - French content
 * @property {string} summaryEn - English summary
 * @property {string} summaryRw - Kinyarwanda summary
 * @property {string} summaryFr - French summary
 * @property {string} category - Article category
 * @property {string} difficultyLevel - Difficulty level
 * @property {number} estimatedReadTimeMinutes - Estimated reading time
 * @property {Array<string>} tags - Article tags
 * @property {boolean} isPublic - Whether article is public
 * @property {string} featuredImage - Featured image URL
 * @property {string} youtubeVideoUrl - YouTube video URL
 * @property {number} relatedArtifactId - Related artifact ID
 * @property {number} relatedHeritageSiteId - Related heritage site ID
 * @property {number} quizId - Associated quiz ID
 * @property {string} createdBy - Creator username
 * @property {string} createdDate - Creation date
 * @property {string} updatedBy - Last updater username
 * @property {string} updatedDate - Last update date
 */

/**
 * Quiz Data Structure
 * @typedef {Object} Quiz
 * @property {number} id - Unique identifier
 * @property {string} titleEn - English title
 * @property {string} titleRw - Kinyarwanda title
 * @property {string} titleFr - French title
 * @property {string} descriptionEn - English description
 * @property {string} descriptionRw - Kinyarwanda description
 * @property {string} descriptionFr - French description
 * @property {number} articleId - Associated article ID
 * @property {number} passingScorePercentage - Passing score percentage
 * @property {number} timeLimitMinutes - Time limit in minutes
 * @property {number} maxAttempts - Maximum attempts allowed
 * @property {boolean} isActive - Whether quiz is active
 * @property {boolean} isPublic - Whether quiz is public
 * @property {string} tags - Comma-separated tags
 * @property {string} createdBy - Creator username
 * @property {string} createdDate - Creation date
 * @property {string} updatedBy - Last updater username
 * @property {string} updatedDate - Last update date
 */

/**
 * Quiz Question Data Structure
 * @typedef {Object} QuizQuestion
 * @property {number} id - Unique identifier
 * @property {number} quizId - Associated quiz ID
 * @property {string} questionTextEn - English question text
 * @property {string} questionTextRw - Kinyarwanda question text
 * @property {string} questionTextFr - French question text
 * @property {string} questionType - Question type (MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK)
 * @property {number} points - Points for correct answer
 * @property {number} questionOrder - Question order
 * @property {string} explanationEn - English explanation
 * @property {string} explanationRw - Kinyarwanda explanation
 * @property {string} explanationFr - French explanation
 * @property {Array<QuizOption>} options - Answer options
 */

/**
 * Quiz Option Data Structure
 * @typedef {Object} QuizOption
 * @property {number} id - Unique identifier
 * @property {number} questionId - Associated question ID
 * @property {string} optionTextEn - English option text
 * @property {string} optionTextRw - Kinyarwanda option text
 * @property {string} optionTextFr - French option text
 * @property {boolean} isCorrect - Whether option is correct
 * @property {number} optionOrder - Option order
 */

/**
 * Quiz Creation DTO Structure
 * @typedef {Object} QuizCreationDTO
 * @property {Quiz} quiz - Quiz data
 * @property {Array<QuizQuestion>} questions - Quiz questions
 */

/**
 * Learning Progress Data Structure
 * @typedef {Object} LearningProgress
 * @property {number} id - Unique identifier
 * @property {number} userId - User ID
 * @property {number} articleId - Article ID
 * @property {number} quizId - Quiz ID (optional)
 * @property {string} status - Progress status (NOT_STARTED, IN_PROGRESS, COMPLETED)
 * @property {number} completionPercentage - Completion percentage
 * @property {string} lastAccessedDate - Last accessed date
 * @property {string} completedDate - Completion date
 */

// ============================================================================
// EDUCATIONAL ARTICLES
// ============================================================================

/**
 * Create a new educational article
 * @param {EducationalArticle} articleData - Article data
 * @returns {Promise<EducationalArticle>} Created article
 */
const createArticle = async (articleData) => {
    return httpClient.post(ENDPOINTS.ARTICLES, articleData);
};

/**
 * Get article by ID
 * @param {number} id - Article ID
 * @returns {Promise<EducationalArticle>} Article data
 */
const getArticleById = async (id) => {
    const url = ENDPOINTS.ARTICLE_BY_ID.replace('{id}', id);
    return httpClient.get(url);
};

/**
 * Get all articles
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<EducationalArticle>>} List of articles
 */
const getArticles = async (params = {}) => {
    return httpClient.get(ENDPOINTS.ARTICLES, { params });
};

/**
 * Get public articles
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<EducationalArticle>>} List of public articles
 */
const getPublicArticles = async (params = {}) => {
    return httpClient.get(ENDPOINTS.ARTICLE_PUBLIC, { params });
};

/**
 * Get articles by category
 * @param {string} category - Category name
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<EducationalArticle>>} List of articles by category
 */
const getArticlesByCategory = async (category, params = {}) => {
    const url = ENDPOINTS.ARTICLE_CATEGORY.replace('{category}', category);
    return httpClient.get(url, { params });
};

/**
 * Get articles by difficulty level
 * @param {string} difficulty - Difficulty level
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<EducationalArticle>>} List of articles by difficulty
 */
const getArticlesByDifficulty = async (difficulty, params = {}) => {
    const url = ENDPOINTS.ARTICLE_DIFFICULTY.replace('{difficulty}', difficulty);
    return httpClient.get(url, { params });
};

/**
 * Search articles
 * @param {string} query - Search query
 * @param {Object} params - Additional search parameters
 * @returns {Promise<Array<EducationalArticle>>} Search results
 */
const searchArticles = async (query, params = {}) => {
    const searchParams = { query, ...params };
    return httpClient.get(ENDPOINTS.ARTICLE_SEARCH, { params: searchParams });
};

/**
 * Get article in specific language
 * @param {number} id - Article ID
 * @param {string} language - Language code (en, rw, fr)
 * @returns {Promise<EducationalArticle>} Article in specified language
 */
const getArticleByLanguage = async (id, language) => {
    const url = ENDPOINTS.ARTICLE_LANGUAGE
        .replace('{id}', id)
        .replace('{language}', language);
    return httpClient.get(url);
};

/**
 * Get articles by language
 * @param {string} language - Language code (en, rw, fr)
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<EducationalArticle>>} List of articles in specified language
 */
const getArticlesByLanguage = async (language, params = {}) => {
    const url = ENDPOINTS.ARTICLE_LANGUAGE_LIST.replace('{language}', language);
    return httpClient.get(url, { params });
};

/**
 * Update article
 * @param {number} id - Article ID
 * @param {EducationalArticle} articleData - Updated article data
 * @returns {Promise<EducationalArticle>} Updated article
 */
const updateArticle = async (id, articleData) => {
    const url = ENDPOINTS.ARTICLE_BY_ID.replace('{id}', id);
    return httpClient.put(url, articleData);
};

/**
 * Delete article
 * @param {number} id - Article ID
 * @returns {Promise<void>} Success response
 */
const deleteArticle = async (id) => {
    const url = ENDPOINTS.ARTICLE_BY_ID.replace('{id}', id);
    return httpClient.delete(url);
};

// ============================================================================
// QUIZZES
// ============================================================================

/**
 * Create a new quiz
 * @param {Quiz} quizData - Quiz data
 * @returns {Promise<Quiz>} Created quiz
 */
const createQuiz = async (quizData) => {
    return httpClient.post(ENDPOINTS.QUIZZES, quizData);
};

/**
 * Create a quiz question
 * @param {QuizQuestionDTO} questionData - Question data
 * @returns {Promise<QuizQuestionDTO>} Created question
 */
const createQuizQuestion = async (questionData) => {
    return httpClient.post(ENDPOINTS.QUIZZES + '/questions', questionData);
};

/**
 * Create a full quiz with questions
 * @param {QuizCreationDTO} quizCreationData - Quiz creation data
 * @returns {Promise<QuizCreationDTO>} Created quiz with questions
 */
const createFullQuiz = async (quizCreationData) => {
    return httpClient.post(ENDPOINTS.QUIZ_FULL, quizCreationData);
};

/**
 * Get quiz by ID
 * @param {number} id - Quiz ID
 * @returns {Promise<Quiz>} Quiz data
 */
const getQuizById = async (id) => {
    const url = ENDPOINTS.QUIZ_BY_ID.replace('{id}', id);
    return httpClient.get(url);
};

/**
 * Get all quizzes
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<Quiz>>} List of quizzes
 */
const getQuizzes = async (params = {}) => {
    return httpClient.get(ENDPOINTS.QUIZZES, { params });
};

/**
 * Get public quizzes
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<Quiz>>} List of public quizzes
 */
const getPublicQuizzes = async (params = {}) => {
    return httpClient.get(ENDPOINTS.QUIZ_PUBLIC, { params });
};

/**
 * Search quizzes
 * @param {string} query - Search query
 * @param {Object} params - Additional search parameters
 * @returns {Promise<Array<Quiz>>} Search results
 */
const searchQuizzes = async (query, params = {}) => {
    const searchParams = { query, ...params };
    return httpClient.get(ENDPOINTS.QUIZ_SEARCH, { params: searchParams });
};

/**
 * Get quizzes by tags
 * @param {string|string[]} tag - Tag string or array of tags
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<Quiz>>} List of quizzes by tags
 */
const getQuizzesByTags = async (tag, params = {}) => {
    const tagParam = Array.isArray(tag) ? tag.join(',') : tag;
    const url = ENDPOINTS.QUIZ_TAGS.replace('{tag}', tagParam);
    return httpClient.get(url, { params });
};

/**
 * Get quizzes with tags
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<Quiz>>} List of quizzes with tags
 */
const getQuizzesWithTags = async (params = {}) => {
    return httpClient.get(ENDPOINTS.QUIZ_WITH_TAGS, { params });
};

/**
 * Get quizzes by article
 * @param {number} articleId - Article ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<Quiz>>} List of quizzes by article
 */
const getQuizzesByArticle = async (articleId, params = {}) => {
    const url = ENDPOINTS.QUIZ_BY_ARTICLE.replace('{articleId}', articleId);
    return httpClient.get(url, { params });
};

/**
 * Get quiz in specific language
 * @param {number} id - Quiz ID
 * @param {string} language - Language code (en, rw, fr)
 * @returns {Promise<Quiz>} Quiz in specified language
 */
const getQuizByLanguage = async (id, language) => {
    const url = ENDPOINTS.QUIZ_LANGUAGE
        .replace('{id}', id)
        .replace('{language}', language);
    return httpClient.get(url);
};

/**
 * Get quizzes by language
 * @param {string} language - Language code (en, rw, fr)
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<Quiz>>} List of quizzes in specified language
 */
const getQuizzesByLanguage = async (language, params = {}) => {
    const url = ENDPOINTS.QUIZ_LANGUAGE_LIST.replace('{language}', language);
    return httpClient.get(url, { params });
};

/**
 * Update quiz
 * @param {number} id - Quiz ID
 * @param {Quiz} quizData - Updated quiz data
 * @returns {Promise<Quiz>} Updated quiz
 */
const updateQuiz = async (id, quizData) => {
    const url = ENDPOINTS.QUIZ_BY_ID.replace('{id}', id);
    return httpClient.put(url, quizData);
};

/**
 * Delete quiz
 * @param {number} id - Quiz ID
 * @returns {Promise<void>} Success response
 */
const deleteQuiz = async (id) => {
    const url = ENDPOINTS.QUIZ_BY_ID.replace('{id}', id);
    return httpClient.delete(url);
};

// ============================================================================
// QUIZ MANAGEMENT
// ============================================================================

/**
 * Start a quiz attempt
 * @param {number} quizId - Quiz ID
 * @returns {Promise<Object>} QuizAttemptDTO data
 */
const startQuiz = async (quizId) => {
    const url = ENDPOINTS.QUIZ_START.replace('{quizId}', quizId);
    return httpClient.post(url);
};

/**
 * Submit quiz answers
 * @param {number} attemptId - Attempt ID
 * @param {Object} answers - Question/option map
 * @returns {Promise<Object>} QuizAttemptDTO with results
 */
const submitQuiz = async (attemptId, answers) => {
    const url = ENDPOINTS.QUIZ_SUBMIT.replace('{attemptId}', attemptId);
    return httpClient.post(url, answers);
};

/**
 * Get quiz attempts for a user
 * @param {string|number} userId - User ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<Object>>} List of quiz attempts
 */
const getQuizAttempts = async (userId, params = {}) => {
    const url = ENDPOINTS.QUIZ_ATTEMPTS.replace('{userId}', userId);
    return httpClient.get(url, { params });
};

/**
 * Get quiz attempt by ID
 * @param {number} attemptId - Attempt ID
 * @returns {Promise<Object>} Quiz attempt data
 */
const getQuizAttemptById = async (attemptId) => {
    const url = ENDPOINTS.QUIZ_ATTEMPT_BY_ID.replace('{attemptId}', attemptId);
    return httpClient.get(url);
};

// ============================================================================
// LEARNING PROGRESS
// ============================================================================

/**
 * Get learning progress
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<LearningProgress>>} List of learning progress
 */
const getLearningProgress = async (params = {}) => {
    return httpClient.get(ENDPOINTS.LEARNING_PROGRESS, { params });
};

/**
 * Get learning progress by user
 * @param {number} userId - User ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<LearningProgress>>} List of user's learning progress
 */
const getLearningProgressByUser = async (userId, params = {}) => {
    const url = ENDPOINTS.PROGRESS_BY_USER.replace('{userId}', userId);
    return httpClient.get(url, { params });
};

/**
 * Get learning progress by article
 * @param {number} articleId - Article ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<LearningProgress>>} List of article learning progress
 */
const getLearningProgressByArticle = async (articleId, params = {}) => {
    const url = ENDPOINTS.PROGRESS_BY_ARTICLE.replace('{articleId}', articleId);
    return httpClient.get(url, { params });
};

/**
 * Get learning progress by quiz
 * @param {number} quizId - Quiz ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Array<LearningProgress>>} List of quiz learning progress
 */
const getLearningProgressByQuiz = async (quizId, params = {}) => {
    const url = ENDPOINTS.PROGRESS_BY_QUIZ.replace('{quizId}', quizId);
    return httpClient.get(url, { params });
};

/**
 * Get progress statistics for current user
 * @returns {Promise<Object>} Statistics data
 */
const getProgressStatistics = async () => {
    return httpClient.get(ENDPOINTS.PROGRESS_STATISTICS);
};

/**
 * Get recent learning activity for current user
 * @returns {Promise<Array<Object>>} Recent activity list
 */
const getRecentProgressActivity = async () => {
    return httpClient.get(ENDPOINTS.PROGRESS_RECENT_ACTIVITY);
};

/**
 * Get learning achievements for current user
 * @returns {Promise<Array<Object>>} Achievements list
 */
const getProgressAchievements = async () => {
    return httpClient.get(ENDPOINTS.PROGRESS_ACHIEVEMENTS);
};

/**
 * Get quiz history for current user
 * @returns {Promise<Array<Object>>} Quiz attempt history
 */
const getQuizHistory = async () => {
    return httpClient.get(ENDPOINTS.PROGRESS_QUIZ_HISTORY);
};

// ============================================================================
// CATEGORIES AND DIFFICULTY LEVELS
// ============================================================================

/**
 * Get available categories
 * @returns {Promise<Array<string>>} List of categories
 */
const getCategories = async () => {
    return httpClient.get(ENDPOINTS.CATEGORIES);
};

/**
 * Get available difficulty levels
 * @returns {Promise<Array<string>>} List of difficulty levels
 */
const getDifficultyLevels = async () => {
    return httpClient.get(ENDPOINTS.DIFFICULTY_LEVELS);
};

// ============================================================================
// NAMED EXPORTS
// ============================================================================

export {
    // Articles
    createArticle,
    getArticleById,
    getArticles,
    getPublicArticles,
    getArticlesByCategory,
    getArticlesByDifficulty,
    searchArticles,
    getArticleByLanguage,
    getArticlesByLanguage,
    updateArticle,
    deleteArticle,

    // Quizzes
    createQuiz,
    createQuizQuestion,
    createFullQuiz,
    getQuizById,
    getQuizzes,
    getPublicQuizzes,
    searchQuizzes,
    getQuizzesByTags,
    getQuizzesWithTags,
    getQuizzesByArticle,
    getQuizByLanguage,
    getQuizzesByLanguage,
    updateQuiz,
    deleteQuiz,

    // Quiz Management
    startQuiz,
    submitQuiz,
    getQuizAttempts,
    getQuizAttemptById,

    // Learning Progress
    getLearningProgress,
    getLearningProgressByUser,
    getLearningProgressByArticle,
    getLearningProgressByQuiz,
    getProgressStatistics,
    getRecentProgressActivity,
    getProgressAchievements,
    getQuizHistory,

    // Categories and Difficulty
    getCategories,
    getDifficultyLevels
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
    // Articles
    createArticle,
    getArticleById,
    getArticles,
    getPublicArticles,
    getArticlesByCategory,
    getArticlesByDifficulty,
    searchArticles,
    getArticleByLanguage,
    getArticlesByLanguage,
    updateArticle,
    deleteArticle,

    // Quizzes
    createQuiz,
    createQuizQuestion,
    createFullQuiz,
    getQuizById,
    getQuizzes,
    getPublicQuizzes,
    searchQuizzes,
    getQuizzesByTags,
    getQuizzesWithTags,
    getQuizzesByArticle,
    getQuizByLanguage,
    getQuizzesByLanguage,
    updateQuiz,
    deleteQuiz,

    // Quiz Management
    startQuiz,
    submitQuiz,
    getQuizAttempts,
    getQuizAttemptById,

    // Learning Progress
    getLearningProgress,
    getLearningProgressByUser,
    getLearningProgressByArticle,
    getLearningProgressByQuiz,
    getProgressStatistics,
    getRecentProgressActivity,
    getProgressAchievements,
    getQuizHistory,

    // Categories and Difficulty
    getCategories,
    getDifficultyLevels,
};
