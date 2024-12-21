import { toast } from '@/components/ui/use-toast';
import { AppError } from './base';

export function handleError(error: unknown): AppError {
  const appError = AppError.from(error);
  
  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', {
      name: appError.name,
      message: appError.message,
      code: appError.code,
      status: appError.status,
      data: appError.data,
      stack: appError.stack
    });
  }

  return appError;
}

export function handleErrorWithToast(error: unknown, defaultMessage?: string): AppError {
  const appError = handleError(error);

  toast({
    variant: "destructive",
    title: "Error",
    description: appError.message || defaultMessage || 'An unexpected error occurred',
  });

  return appError;
}

export function handleApiError(error: unknown) {
  const appError = handleError(error);
  
  return Response.json(
    { 
      error: {
        message: appError.message,
        code: appError.code
      }
    },
    { status: appError.status || 500 }
  );
}