import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import {
    BookOpen,
    Clock,
    CheckCircle,
    XCircle,
    Trophy,
    Target,
    TrendingUp,
    Play,
    History
} from 'lucide-react';
import { useGet } from '../../hooks/useSimpleApi';
import { startQuiz as startQuizApi, submitQuiz as submitQuizApi } from '../../services/api/educationApi';

import { toast } from 'react-hot-toast';

const QuizTaking = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('available');
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isQuizActive, setIsQuizActive] = useState(false);
    const [currentAttempt, setCurrentAttempt] = useState(null);
    const [starting, setStarting] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // API hooks
    const { data: availableQuizzes, loading: quizzesLoading, refetch: refetchQuizzes } = useGet('/api/education/quizzes', { isPublic: true, isActive: true }, {
        onSuccess: (data) => console.log('Available quizzes loaded:', data),
        onError: (error) => console.error('Failed to load available quizzes:', error)
    });

    const attemptsUrl = user ? `/api/education/quizzes/user/${user.id}/attempts` : null;
    const { data: userAttempts, loading: attemptsLoading, refetch: refetchAttempts } = useGet(attemptsUrl, {}, {
        onSuccess: (data) => console.log('User attempts loaded:', data),
        onError: (error) => console.error('Failed to load user attempts:', error),
        enabled: !!user?.id
    });

    const { data: quizStatistics, loading: statsLoading } = useGet('/api/education/quizzes/statistics', {}, {
        onSuccess: (data) => console.log('Quiz statistics loaded:', data),
        onError: (error) => console.error('Failed to load quiz statistics:', error)
    });

    // Start a quiz attempt
    const handleStartQuiz = async (quiz) => {
        try {
            setStarting(true);
            const attempt = await startQuizApi(quiz.id);
            setSelectedQuiz(quiz);
            setCurrentAttempt(attempt);
            setIsQuizActive(true);
            setCurrentQuestionIndex(0);
            setSelectedAnswers({});
            setTimeLeft((quiz.timeLimit || 0) * 60); // Convert minutes to seconds
            toast.success('Quiz started! Good luck!');
        } catch (error) {
            toast.error('Failed to start quiz. Please try again.');
        } finally {
            setStarting(false);
        }
    };

    // Submit quiz answers
    const handleSubmitQuiz = async () => {
        if (!selectedQuiz || !currentAttempt) return;

        try {
            setSubmitting(true);
            const result = await submitQuizApi(currentAttempt.id, selectedAnswers);
            setIsQuizActive(false);
            setSelectedQuiz(null);
            setCurrentAttempt(null);
            toast.success(`Quiz completed! Score: ${Math.round(result.percentageScore || 0)}%`);
            refetchAttempts();
            refetchQuizzes();
        } catch (error) {
            toast.error('Failed to submit quiz. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Timer effect
    useEffect(() => {
        let timer;
        if (isQuizActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Auto-submit when time runs out
                        handleSubmitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isQuizActive, timeLeft]);

    const handleAnswerSelect = (questionId, answerId) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getQuizDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400">Please log in to access quizzes.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Quiz Taking
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Test your knowledge with interactive quizzes about Rwandan heritage
                </p>
            </div>

            {/* Quiz Statistics */}
            {quizStatistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <BookOpen className="h-8 w-8 text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Quizzes</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {quizStatistics.totalQuizzes || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <Play className="h-8 w-8 text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Public Quizzes</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {quizStatistics.publicQuizzes || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <Target className="h-8 w-8 text-purple-500" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Questions</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {quizStatistics.totalQuestions || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-3">
                                <TrendingUp className="h-8 w-8 text-orange-500" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Attempts</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {quizStatistics.totalAttempts || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Active Quiz */}
            {isQuizActive && selectedQuiz && (
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">
                                {selectedQuiz.title}
                            </CardTitle>
                            <div className="flex items-center space-x-4">
                                <Badge variant="outline" className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatTime(timeLeft)}</span>
                                </Badge>
                                <Badge variant="outline">
                                    Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {selectedQuiz.questions[currentQuestionIndex] && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-4">
                                        {selectedQuiz.questions[currentQuestionIndex].questionText}
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedQuiz.questions[currentQuestionIndex].options?.map((option) => (
                                            <label
                                                key={option.id}
                                                className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${selectedQuiz.questions[currentQuestionIndex].id}`}
                                                    value={option.id}
                                                    checked={selectedAnswers[selectedQuiz.questions[currentQuestionIndex].id] === option.id}
                                                    onChange={() => handleAnswerSelect(selectedQuiz.questions[currentQuestionIndex].id, option.id)}
                                                    className="text-blue-600"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {option.optionText}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <Button
                                        onClick={handlePreviousQuestion}
                                        disabled={currentQuestionIndex === 0}
                                        variant="outline"
                                    >
                                        Previous
                                    </Button>
                                    {currentQuestionIndex === selectedQuiz.questions.length - 1 ? (
                                        <Button
                                            onClick={handleSubmitQuiz}
                                            className="bg-green-600 hover:bg-green-700"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                                        </Button>
                                    ) : (
                                        <Button onClick={handleNextQuestion}>
                                            Next Question
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Quiz Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="available">Available Quizzes</TabsTrigger>
                    <TabsTrigger value="history">Quiz History</TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="space-y-6">
                    {quizzesLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading quizzes...</p>
                        </div>
                    ) : availableQuizzes?.content?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableQuizzes.content.map((quiz) => (
                                <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg mb-2">{quiz.title}</CardTitle>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                    {quiz.description}
                                                </p>
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <Badge className={getQuizDifficultyColor(quiz.difficulty)}>
                                                        {quiz.difficulty || 'Not specified'}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {quiz.questions?.length || 0} questions
                                                    </Badge>
                                                </div>
                                                {quiz.timeLimit && (
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{quiz.timeLimit} minutes</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            onClick={() => handleStartQuiz(quiz)}
                                            className="w-full"
                                            disabled={starting}
                                        >
                                            {starting ? 'Starting...' : 'Start Quiz'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No quizzes available
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Check back later for new quizzes or contact an administrator.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    {attemptsLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading history...</p>
                        </div>
                    ) : userAttempts?.length > 0 ? (
                        <div className="space-y-4">
                            {userAttempts.map((attempt) => {
                                const score = attempt.percentageScore || 0;
                                return (
                                    <Card key={attempt.id}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold mb-2">Quiz #{attempt.quizId}</h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                                        <span>Score: {Math.round(score)}%</span>
                                                        <span>Time: {attempt.timeTakenMinutes || 0}m</span>
                                                        <span>Date: {attempt.endTime ? new Date(attempt.endTime).toLocaleDateString() : ''}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {score >= 80 ? (
                                                        <Trophy className="h-6 w-6 text-yellow-500" />
                                                    ) : score >= 60 ? (
                                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                                    ) : (
                                                        <XCircle className="h-6 w-6 text-red-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    No quiz attempts yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Start taking quizzes to see your history here.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

            </Tabs>
        </div>
    );
};

export default QuizTaking;
