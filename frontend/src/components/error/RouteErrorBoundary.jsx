import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

class RouteErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        const errorId = `route_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.setState({
            error,
            errorInfo,
            errorId
        });

        if (process.env.NODE_ENV === 'development') {
            console.error('Route Error Boundary Caught Error:', error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        });
    };

    handleGoBack = () => {
        window.history.back();
    };

    render() {
        if (this.state.hasError) {
            const { error, errorId } = this.state;
            const { routeName = 'this section' } = this.props;

            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {routeName} Error
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                There was a problem loading {routeName}. You can try again or go back.
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

export default RouteErrorBoundary;


