import { useState } from 'react';
import { AuthError } from '@/lib/errors';

export function useAuthError() {
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = (err: unknown) => {
    if (err instanceof AuthError) {
      switch (err.code) {
        case 'AUTH_ERROR':
          setError(err.message);
          break;
        case 'VALIDATION_ERROR':
          if (err.message.includes('email')) {
            setError('Invalid email format. Please check your email address.');
          } else if (err.message.toLowerCase().includes('password')) {
            setError('Password is too weak. Please use a stronger password.');
          } else {
            setError(err.message);
          }
          break;
        default:
          setError('An authentication error occurred. Please try again.');
      }
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return { error, setError, handleAuthError };
} 