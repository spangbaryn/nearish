"use client";

import { useAuth } from "@/lib/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        // Force a hard reload if still loading after 2 seconds
        window.location.reload();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // If loading for less than 2 seconds, show spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If no user, middleware will handle redirect
  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-muted/50 via-background to-muted/50">
      <div className="min-h-screen flex items-start justify-center px-4 pt-[10vh]">
        {children}
      </div>
    </main>
  );
} 