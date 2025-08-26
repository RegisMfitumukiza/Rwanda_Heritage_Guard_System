import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

class ComponentErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error to console for development
        if (process.env.NODE_ENV === 'development') {
            console.error('Component Error Boundary caught an error:', error, errorInfo);
        }

        // In production, you could send this to an error reporting service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    handleRetry = () => {
        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: prevState.retryCount + 1
        }));
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            const { fallback: FallbackComponent, componentName = 'Component' } = this.props;

            // If a custom fallback is provided, use it
            if (FallbackComponent) {
                return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
            }

            // Default error fallback UI
            return (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8"
                >
                    <div className="text-center max-w-md mx-auto">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                            Something went wrong
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {componentName} encountered an error. This might be a temporary issue.
                        </p>

                        {this.state.retryCount > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                                Retry attempt: {this.state.retryCount}
                            </p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={this.handleRetry}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={this.state.retryCount >= 3}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {this.state.retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={this.handleGoHome}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Go Home
                            </Button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                    Error Details (Development)
                                </summary>
                                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-700 dark:text-gray-300 overflow-auto">
                                    <div className="mb-2">
                                        <strong>Error:</strong> {this.state.error.toString()}
                                    </div>
                                    {this.state.errorInfo && (
                                        <div>
                                            <strong>Component Stack:</strong>
                                            <pre className="whitespace-pre-wrap mt-1">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}
                    </div>
                </motion.div>
            );
        }

        return this.props.children;
    }
}

export default ComponentErrorBoundary;


