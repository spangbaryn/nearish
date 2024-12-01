"use client";

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function NotFound() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
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