"use client";

import React from "react";
import { TRPCClientError } from "@trpc/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangleIcon, RefreshCwIcon, HomeIcon } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    console.error("Error Boundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: "",
    });
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;

      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={error!} reset={this.handleReset} />;
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={error!}
          reset={this.handleReset}
          onGoHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  reset: () => void;
  onGoHome: () => void;
}

function DefaultErrorFallback({
  error,
  reset,
  onGoHome,
}: DefaultErrorFallbackProps) {
  const isTRPCError = error instanceof TRPCClientError;
  const isNetworkError =
    error.message.toLowerCase().includes("network") ||
    error.message.toLowerCase().includes("fetch");
  const isServerError =
    isTRPCError && error.data?.httpStatus && error.data.httpStatus >= 500;

  const getErrorMessage = () => {
    if (isNetworkError) {
      return {
        title: "Connection Problem",
        description:
          "Unable to connect to our servers. Please check your internet connection and try again.",
        suggestion:
          "This might be a temporary network issue. Try refreshing the page.",
      };
    }

    if (isServerError) {
      return {
        title: "Server Error",
        description:
          "Our servers are experiencing issues. Please try again in a few moments.",
        suggestion: "If the problem persists, please contact our support team.",
      };
    }

    if (isTRPCError) {
      return {
        title: "Application Error",
        description:
          error.message || "An unexpected error occurred in the application.",
        suggestion:
          "Try refreshing the page or navigating back to the dashboard.",
      };
    }

    return {
      title: "Unexpected Error",
      description: "Something went wrong. Please try refreshing the page.",
      suggestion: "If the problem continues, please report this issue.",
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">{errorInfo.title}</CardTitle>
          <CardDescription className="text-center">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {errorInfo.suggestion}
          </p>

          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 p-3 bg-muted rounded-md">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs overflow-auto whitespace-pre-wrap break-words">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={reset} className="w-full">
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onGoHome} className="w-full">
              <HomeIcon className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for handling tRPC errors in components
export function useTRPCErrorHandler() {
  return React.useCallback((error: unknown) => {
    if (error instanceof TRPCClientError) {
      console.error("tRPC Error:", error);

      const status = error.data?.httpStatus;
      if (status === 401) {
        // Redirect to login
        window.location.href = "/sign-in";
        return;
      }

      if (status === 403) {
        // Show access denied message
        return "You don't have permission to perform this action.";
      }

      if (status === 429) {
        // Rate limiting
        return "Too many requests. Please wait a moment and try again.";
      }

      if (status && status >= 500) {
        // Server error
        return "Server error occurred. Please try again later.";
      }

      // Return the error message from the server
      return error.message || "An unexpected error occurred.";
    }

    return "An unexpected error occurred.";
  }, []);
}

// Query error boundary specifically for tRPC queries
interface QueryErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

function QueryErrorFallback({
  error,
  reset,
  onError,
}: {
  error: Error;
  reset: () => void;
  onError?: (error: Error) => void;
}) {
  React.useEffect(() => {
    onError?.(error);
  }, [error, onError]);

  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded-md">
      <div className="flex items-center gap-2 text-red-800 mb-2">
        <AlertTriangleIcon className="h-4 w-4" />
        <span className="font-medium">Failed to load data</span>
      </div>
      <p className="text-sm text-red-700 mb-3">
        {error instanceof TRPCClientError
          ? error.message
          : "An error occurred while loading data."}
      </p>
      <Button size="sm" variant="outline" onClick={reset}>
        <RefreshCwIcon className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}

export function QueryErrorBoundary({
  children,
  onError,
}: QueryErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <QueryErrorFallback error={error} reset={reset} onError={onError} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
