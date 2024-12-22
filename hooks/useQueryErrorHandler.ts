import { useCallback } from 'react';
import { handleErrorWithToast } from '@/lib/errors';
import { toast } from '@/components/ui/use-toast';

export function useQueryErrorHandler() {
  return {
    onError: useCallback((error: unknown) => {
      handleErrorWithToast(error);
    }, []),
    onSuccess: useCallback(() => {
      toast({
        title: "Success",
        description: "Operation completed successfully"
      });
    }, [])
  };
} 