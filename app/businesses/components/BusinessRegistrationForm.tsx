"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBusiness } from "@/lib/business";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Database } from "@/types/database.types";
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAuth } from "@/lib/auth-context";

type Business = Database['public']['Tables']['businesses']['Insert'];

export function BusinessRegistrationForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Business>({
    name: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      await createBusiness(formData, user.id);
      router.push('/dashboard');
    } catch (error) {
      handleError(error, 'Failed to create business');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Register Your Business</CardTitle>
        <CardDescription>Create your business profile to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Business'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 