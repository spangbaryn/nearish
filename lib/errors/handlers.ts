import { toast } from '@/components/ui/use-toast';
import { AppError } from './base';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export function handleError(error: unknown, level: LogLevel = 'ERROR'): AppError {
  const appError = AppError.from(error);
  
  if (process.env.NODE_ENV === 'development') {
    const logMethod = {
      INFO: console.info,
      WARN: console.warn,
      ERROR: console.error
    }[level];
    
    logMethod('Error details:', {
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
    { error: appError.message },
    { status: appError.status }
  );
}