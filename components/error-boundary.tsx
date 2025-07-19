"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ error, errorInfo })

        // Log error for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo)

        // Call optional error handler
        this.props.onError?.(error, errorInfo)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback

            if (FallbackComponent) {
                return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
            }

            return <DefaultErrorFallback error={this.state.error} retry={this.handleRetry} />
        }

        return this.props.children
    }
}

interface ErrorFallbackProps {
    error?: Error
    retry: () => void
}

function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
    return (
        <Card className="max-w-md mx-auto mt-8">
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-red-600 dark:text-red-400">Something went wrong</CardTitle>
                <CardDescription>
                    An unexpected error occurred. Please try again or refresh the page.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                {process.env.NODE_ENV === 'development' && error && (
                    <details className="text-left text-sm bg-muted p-3 rounded">
                        <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                        <pre className="whitespace-pre-wrap text-xs">{error.message}</pre>
                    </details>
                )}
                <div className="flex gap-2 justify-center">
                    <Button onClick={retry} variant="outline">
                        Try Again
                    </Button>
                    <Button onClick={() => window.location.reload()}>
                        Refresh Page
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

// Hook version for functional components
export function useErrorBoundary() {
    const [error, setError] = React.useState<Error | null>(null)

    const resetError = React.useCallback(() => {
        setError(null)
    }, [])

    const captureError = React.useCallback((error: Error) => {
        setError(error)
    }, [])

    React.useEffect(() => {
        if (error) {
            throw error
        }
    }, [error])

    return { captureError, resetError }
}
