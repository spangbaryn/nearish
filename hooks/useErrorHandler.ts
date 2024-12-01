import { useState } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: unknown, defaultMessage: string = 'An error occurred') => {
    const message = error instanceof Error ? error.message : defaultMessage;
    setError(message);
    return message;
  };

  return {
    error,
    setError,
    handleError
  };
} 