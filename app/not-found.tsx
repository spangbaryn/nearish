"use client";

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function NotFound() {
  const { user, loading, initialized } = useAuth();

  // Don't show anything until auth is initialized
  if (!initialized) {
    return null;
  }

  // Only show loading after initialization
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="mb-4">The page you're looking for doesn't exist.</p>
        <Link 
          href={user ? "/home" : "/"} 
          className="text-blue-500 hover:underline"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 