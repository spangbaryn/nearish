"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Database } from "@/types/database.types";
import { useErrorHandler } from '@/hooks/useErrorHandler';

type Business = Database['public']['Tables']['businesses']['Insert'];

export default function BusinessRegistrationForm() {
  const router = useRouter();
  const { error, handleAppError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState<Business>({
    name: '',
    description: '',
    owner_id: ''
  });

  const validateForm = () => {
    if (!business.name.trim()) {
      handleAppError(new Error('Business name is required'));
      return false;
    }
    if (business.name.length < 2) {
      handleAppError(new Error('Business name must be at least 2 characters'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in to register a business');

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          ...business,
          owner_id: user.id,
        })
        .select()
        .single();

      if (businessError) throw businessError;

      const { error: userError } = await supabase
        .from('users')
        .update({ 
          role: 'Business',
          business_role: 'Owner',
          business_id: businessData.id 
        })
        .eq('id', user.id);

      if (userError) throw userError;

      router.push('/businesses/dashboard');
    } catch (err) {
      handleAppError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Register Your Business</CardTitle>
        <CardDescription>
          Create your business profile to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              value={business.name}
              onChange={(e) => setBusiness({ ...business, name: e.target.value })}
              required
              minLength={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={business.description || ''}
              onChange={(e) => setBusiness({ ...business, description: e.target.value })}
              placeholder="Tell us about your business..."
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Business'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 