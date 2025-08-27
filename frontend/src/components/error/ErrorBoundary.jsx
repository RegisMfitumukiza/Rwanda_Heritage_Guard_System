import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null,
            errorCategory: 'general'
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Generate unique error ID for tracking
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Categorize error for better handling
        const errorCategory = this.categorizeError(error);

        this.setState({
            error,
            errorInfo,
            errorId,
            errorCategory
        });

        // Log error to console for development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Boundary Caught Error:', {
                error,
                errorInfo,
                category: errorCategory,
                errorId
            });
        }

        // In production, you could send this to an error reporting service
        // this.logErrorToService(error, errorInfo, errorId);
    }

    categorizeError = (error) => {
        // Categorize errors for better user experience
        if (error.name === 'TypeError' && error.message.includes('Cannot read property')) {
            return 'data_loading';
        }
        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
            return 'network';
        }
        if (error.name === 'SyntaxError') {
            return 'parsing';
        }
        if (error.message && error.message.includes('authentication')) {
            return 'auth';
        }
        return 'general';
    }

    getErrorTitle = () => {
        const { errorCategory } = this.state;
        const titles = {
            'data_loading': 'Data Loading Error',
            'network': 'Connection Problem',
            'parsing': 'Data Format Error',
            'auth': 'Authentication Error',
            'general': 'Something went wrong'
        };
        return titles[errorCategory] || titles.general;
    }

    getErrorMessage = () => {
        const { errorCategory } = this.state;
        const messages = {
            'data_loading': 'We encountered an issue while loading your data. This might be a temporary problem.',
            'network': 'We\'re having trouble connecting to our servers. Please check your internet connection.',
            'parsing': 'There was an issue processing the data. Please refresh the page and try again.',
            'auth': 'Your session may have expired. Please log in again to continue.',
            'general': 'We\'re sorry, but something unexpected happened. Our team has been notified.'
        };
        return messages[errorCategory] || messages.general;
    }

    logErrorToService = (error, errorInfo, errorId) => {
        // This would integrate with services like Sentry, LogRocket, etc.
        try {
            const errorData = {
                errorId,
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                userId: localStorage.getItem('userId') || 'anonymous'
            };

            // Send to error reporting service
            // fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorData) });
            console.log('Error logged:', errorData);
        } catch (loggingError) {
            console.error('Failed to log error:', loggingError);
        }
    };

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleGoBack = () => {
        window.history.back();
    };

    render() {
        if (this.state.hasError) {
            const { error, errorId } = this.state;

            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Something went wrong
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                We're sorry, but something unexpected happened. Our team has been notified.
                            </p>
                            {errorId && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 font-mono">
                                    Error ID: {errorId}
                                </p>
                            )}
                        </div>

                        {process.env.NODE_ENV === 'development' && error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-2">
                                    Error Details (Development)
                                </summary>
                                <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-32">
                                    <div className="mb-2">
                                        <strong>Message:</strong> {error.message}
                                    </div>
                                    {error.stack && (
                                        <div>
                                            <strong>Stack:</strong>
                                            <pre className="whitespace-pre-wrap break-words">
                                                {error.stack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}

                        <div className="space-y-3">
                            <Button
                                onClick={this.handleRetry}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>

                            <Button
                                onClick={this.handleGoBack}
                                variant="outline"
                                className="w-full"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>

                            <Button
                                onClick={this.handleGoHome}
                                variant="ghost"
                                className="w-full"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                If this problem persists, please contact support with the Error ID above.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;


