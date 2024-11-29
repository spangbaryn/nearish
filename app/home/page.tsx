"use client";

import { useAuth } from "@/lib/auth-context";
import { redirect } from "next/navigation";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
      <p>You are logged in as {user.email}</p>
    </div>
  );
} 