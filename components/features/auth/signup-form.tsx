"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthCard } from "./auth-card";
import { AuthForm, AuthFormField } from "./auth-form";
import { Logo } from "@/components/ui/logo";

export function SignUpForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signUp(email, password);
      router.push("/home");
    } catch {
      setError("Error creating account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={<Logo className="h-10 w-10" />}
      heading="Create account"
      description="Get started with Nearish"
    >
      <AuthForm onSubmit={handleSubmit} loading={loading} error={error} variant="signup">
        <AuthFormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthFormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </AuthForm>
    </AuthCard>
  );
}
