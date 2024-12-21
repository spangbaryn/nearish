"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";
import { handleError } from "@/lib/errors";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = handleError(error);
    
    // Log error with component stack in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Uncaught error:', {
        error: appError,
        componentStack: errorInfo.componentStack
      });
    }

    this.props.onError?.(error, errorInfo);

    toast({
      variant: "destructive",
      title: "Something went wrong",
      description: appError.message
    });
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600">Please try refreshing the page</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 