"use client"

import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, error } = useAuth();

  if (error) {
    redirect("/auth/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    redirect("/auth/login");
  }

  return children;
} 