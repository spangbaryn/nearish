import { useCallback } from 'react';
import { handleErrorWithToast } from '@/lib/errors';

export function useQueryErrorHandler() {
  return useCallback((error: unknown) => {
    handleErrorWithToast(error);
  }, []);
} 