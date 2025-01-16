"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/lib/auth-context";
import { Wordmark } from "@/components/ui/wordmark";
import { Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AuthService } from "@/lib/services/auth.service";

const isEmailValid = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isPasswordStrong = (password: string): boolean => {
  return password.length >= 6;
};

export default function SignUpPage() {
  const router = useRouter();
  const { user, isLoading, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/onboarding");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent you a confirmation link. Please check your email to continue.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEmailValid(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isPasswordStrong(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await signUp(email, password);
      
      // Instead of navigating immediately, wait for email confirmation
      setIsSuccess(true);
    } catch (err) {
      console.error('Signup error:', err);
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 via-background to-muted/50 flex items-center justify-center px-4">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-8 pb-4">
          <div className="pt-2">
            <Wordmark />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-semibold">
              Create a Nearish account
            </CardTitle>
            <CardDescription>
              Sign up to create or join your business.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          {!showEmailForm ? (
            <div className="space-y-4">
              <Button 
                className="w-full flex items-center justify-center gap-2" 
                variant="secondary"
                onClick={() => setShowEmailForm(true)}
              >
                <Mail className="h-4 w-4" />
                Sign up with email
              </Button>
              <Button 
                className="w-full"
                variant="secondary"
                onClick={() => {/* Add Google sign up logic */}}
              >
                Sign up with Google
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSignUp} className="space-y-6">
                {error && (
                  <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-4">
                  <Button className="w-full" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="ghost" 
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                  >
                    Back
                  </Button>
                </div>
              </form>
            </>
          )}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-secondary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
