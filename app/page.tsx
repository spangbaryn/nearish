"use client";

import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to Nearish</h1>
      <a href="/auth/login">Sign in</a>
    </div>
  );
}
