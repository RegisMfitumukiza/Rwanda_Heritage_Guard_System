import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button, Badge, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui';
import { BookOpen, Trophy, Target, TrendingUp, Calendar, Award, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useGet } from '../../hooks/useSimpleApi';

const LearningProgress = () => {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [activeTab, setActiveTab] = useState('overview');

    // API hooks for learning data
    const { data: learningStats, loading: statsLoading } = useGet('/api/education/progress/statistics', {}, {
        onSuccess: (data) => console.log('Learning stats loaded:', data),
        onError: (error) => console.error('Failed to load learning stats:', error)
    });

    const { data: recentActivity, loading: activityLoading } = useGet('/api/education/progress/recent-activity', {}, {
        onSuccess: (data) => console.log('Recent activity loaded:', data),
        onError: (error) => console.error('Failed to load recent activity:', error)
    });

    const { data: achievements, loading: achievementsLoading } = useGet('/api/education/progress/achievements', {}, {
        onSuccess: (data) => console.log('Achievements loaded:', data),
        onError: (error) => console.error('Failed to load achievements:', error)
    });

    const { data: quizHistory, loading: quizHistoryLoading } = useGet('/api/education/progress/quiz-history', {}, {
        onSuccess: (data) => console.log('Quiz history loaded:', data),
        onError: (error) => console.error('Failed to load quiz history:', error)
    });

    if (!user || !['COMMUNITY_MEMBER', 'CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR'].includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-semibold mb-2">{t('Access Denied')}</h2>
                        <p className="text-gray-600">{t('You do not have permission to access this page.')}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('Learning Progress')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t('Track your learning journey and achievements')}
                    </p>
                </div>
            </div>

            {/* Progress Overview Cards */}
            {!statsLoading && learningStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{t('Articles Read')}</p>
                                    <p className="text-2xl font-bold">{learningStats.articlesRead || 0}</p>
                                </div>
                                <BookOpen className="w-8 h-8 text-blue-500" />
                            </div>
                            <Progress value={learningStats.articlesProgress || 0} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{t('Quizzes Completed')}</p>
                                    <p className="text-2xl font-bold">{learningStats.quizzesCompleted || 0}</p>
                                </div>
                                <Target className="w-8 h-8 text-green-500" />
                            </div>
                            <Progress value={learningStats.quizzesProgress || 0} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{t('Average Score')}</p>
                                    <p className="text-2xl font-bold">{learningStats.averageScore || 0}%</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-purple-500" />
                            </div>
                            <Progress value={learningStats.averageScore || 0} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{t('Learning Streak')}</p>
                                    <p className="text-2xl font-bold">{learningStats.learningStreak || 0} {t('days')}</p>
                                </div>
                                <Calendar className="w-8 h-8 text-orange-500" />
                            </div>
                            <Progress value={Math.min((learningStats.learningStreak || 0) / 30 * 100, 100)} className="mt-2" />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">
                        {t('Overview')}
                    </TabsTrigger>
                    <TabsTrigger value="achievements">
                        {t('Achievements')}
                        {achievements && <Badge variant="secondary" className="ml-2">{achievements.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="quiz-history">
                        {t('Quiz History')}
                        {quizHistory && <Badge variant="secondary" className="ml-2">{quizHistory.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="activity">
                        {t('Recent Activity')}
                        {recentActivity && <Badge variant="secondary" className="ml-2">{recentActivity.length}</Badge>}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Learning Goals */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                {t('Learning Goals')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {learningStats?.goals?.map((goal, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{goal.title}</span>
                                        <span className="text-sm text-gray-600">{goal.progress}%</span>
                                    </div>
                                    <Progress value={goal.progress} className="h-2" />
                                    <p className="text-sm text-gray-600">{goal.description}</p>
                                </div>
                            )) || (
                                    <div className="text-center py-8">
                                        <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-600">{t('No learning goals set')}</p>
                                    </div>
                                )}
                        </CardContent>
                    </Card>

                    {/* Learning Categories Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                {t('Category Progress')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {learningStats?.categoryProgress?.map((category, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{category.name}</span>
                                        <span className="text-sm text-gray-600">{category.progress}%</span>
                                    </div>
                                    <Progress value={category.progress} className="h-2" />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{t('{{completed}} of {{total}} completed', {
                                            completed: category.completed,
                                            total: category.total
                                        })}</span>
                                        <span>{category.timeSpent} {t('min')}</span>
                                    </div>
                                </div>
                            )) || (
                                    <div className="text-center py-8">
                                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-600">{t('No category progress data')}</p>
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('Your Achievements')}</h3>
                    </div>

                    {achievementsLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : achievements && achievements.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {achievements.map((achievement) => (
                                <AchievementCard key={achievement.id} achievement={achievement} />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Award className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600">{t('No achievements yet')}</p>
                                <p className="text-sm text-gray-500 mt-2">{t('Keep learning to unlock achievements!')}</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="quiz-history" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('Quiz History')}</h3>
                    </div>

                    {quizHistoryLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : quizHistory && quizHistory.length > 0 ? (
                        <div className="space-y-4">
                            {quizHistory.map((quiz) => (
                                <QuizHistoryCard key={quiz.id} quiz={quiz} />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600">{t('No quiz history yet')}</p>
                                <p className="text-sm text-gray-500 mt-2">{t('Start taking quizzes to see your progress!')}</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{t('Recent Learning Activity')}</h3>
                    </div>

                    {activityLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : recentActivity && recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <ActivityCard key={activity.id} activity={activity} />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600">{t('No recent activity')}</p>
                                <p className="text-sm text-gray-500 mt-2">{t('Start learning to see your activity!')}</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

// Achievement Card Component
const AchievementCard = ({ achievement }) => {
    const { t } = useLanguage();

    return (
        <Card className={`border-l-4 ${achievement.unlocked ? 'border-l-green-500' : 'border-l-gray-300'}`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {achievement.unlocked ? (
                            <Trophy className={`w-6 h-6 ${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`} />
                        ) : (
                            <Star className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                        {achievement.unlocked && (
                            <div className="flex items-center gap-2 mt-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                    {t('Unlocked on')} {new Date(achievement.unlockedDate).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {!achievement.unlocked && achievement.progress && (
                            <div className="mt-2">
                                <Progress value={achievement.progress} className="h-2" />
                                <p className="text-xs text-gray-500 mt-1">
                                    {achievement.progress}% {t('complete')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Quiz History Card Component
const QuizHistoryCard = ({ quiz }) => {
    const { t } = useLanguage();

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreIcon = (score) => {
        if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
        if (score >= 60) return <Target className="w-4 h-4 text-yellow-600" />;
        return <XCircle className="w-4 h-4 text-red-600" />;
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h4 className="font-medium">{quiz.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {quiz.duration} {t('min')}
                            </span>
                            <span className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {quiz.questionsCount} {t('questions')}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(quiz.score)}`}>
                            {quiz.score}%
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            {getScoreIcon(quiz.score)}
                            <span className="text-sm text-gray-600">
                                {quiz.score >= 80 ? t('Excellent') :
                                    quiz.score >= 60 ? t('Good') : t('Needs Improvement')}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(quiz.completedDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Activity Card Component
const ActivityCard = ({ activity }) => {
    const { t } = useLanguage();

    const getActivityIcon = (type) => {
        switch (type) {
            case 'ARTICLE_READ': return <BookOpen className="w-4 h-4 text-blue-500" />;
            case 'QUIZ_COMPLETED': return <Target className="w-4 h-4 text-green-500" />;
            case 'ACHIEVEMENT_UNLOCKED': return <Trophy className="w-4 h-4 text-yellow-500" />;
            default: return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getActivityText = (activity) => {
        switch (activity.type) {
            case 'ARTICLE_READ':
                return t('Read article "{{title}}"', { title: activity.title });
            case 'QUIZ_COMPLETED':
                return t('Completed quiz "{{title}}" with {{score}}%', {
                    title: activity.title,
                    score: activity.score
                });
            case 'ACHIEVEMENT_UNLOCKED':
                return t('Unlocked achievement "{{title}}"', { title: activity.title });
            default:
                return activity.description;
        }
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-gray-100">
                        {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm">{getActivityText(activity)}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default LearningProgress;
