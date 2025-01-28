"use client";

import { useAuth } from "@/lib/auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        if (!user) {
          setTimeout(() => {
            if (!user) {
              router.replace('/auth/login');
            }
            setInitialLoading(false);
            setAuthChecked(true);
          }, 500);
        } else {
          setInitialLoading(false);
          setAuthChecked(true);
        }
      }
    };

    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, [isLoading, user, router]);

  if (initialLoading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-muted/50 via-background to-muted/50">
      <div className="min-h-screen flex items-start justify-center px-4 pt-[15vh]">
        {children}
      </div>
    </main>
  );
} 