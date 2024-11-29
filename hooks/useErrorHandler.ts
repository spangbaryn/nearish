import { useState, useCallback } from 'react';
import { handleError } from '@/lib/error-handler';
import { toast } from '@/components/ui/use-toast';

export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleAppError = useCallback((err: unknown) => {
    const appError = handleError(err);
    setError(appError.message);
    
    toast({
      variant: 'destructive',
      title: 'Error',
      children: appError.message,
    });

    // Log error for monitoring
    console.error('[App Error]:', {
      message: appError.message,
      code: appError.code,
      data: appError.data,
    });
  }, []);

  return {
    error,
    setError,
    handleAppError,
  };
} 