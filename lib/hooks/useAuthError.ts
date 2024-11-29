import { useState } from 'react';

export function useAuthError() {
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = (err: unknown) => {
    if (err instanceof Error) {
      // Handle specific auth error cases
      if (err.message.includes('email')) {
        setError('Invalid email format. Please check your email address.');
      } else if (err.message.toLowerCase().includes('password')) {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError(err.message);
      }
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return { error, setError, handleAuthError };
} 