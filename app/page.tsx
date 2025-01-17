"use client";

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthError } from "@/lib/errors"
import { Card, CardContent } from "@/components/ui/card"
import { PublicNav } from "@/components/public-nav"
import { Wordmark } from "@/components/ui/wordmark"
import { Logo } from "@/components/ui/logo"
import { AuthService } from '@/lib/services/auth.service'
import Image from "next/image"

export default function Home() {
  const [email, setEmail] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isOutOfArea, setIsOutOfArea] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [zipCodeStatus, setZipCodeStatus] = useState<boolean | null>(null)

  const createProfile = useMutation({
    mutationFn: async (data: { email: string; zipCode: string }) => {
      // First check if zip code exists and check its status
      const { data: zipCodeData, error: zipError } = await supabase
        .from('zip_codes')
        .select('is_active')
        .eq('code', data.zipCode)
        .single();

      if (zipError && zipError.code !== 'PGRST116') {
        throw new Error('Failed to check zip code');
      }

      // If zip code doesn't exist in our database
      if (!zipCodeData) {
        setIsOutOfArea(true);
        setIsSuccess(true);
        return null;
      }

      try {
        // First try to find existing profile
        const { data: existingProfile, error: lookupError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.email)
          .maybeSingle();

        if (lookupError) {
          throw new Error('Failed to check existing profile');
        }

        let profileId;

        if (existingProfile) {
          profileId = existingProfile.id;
        } else {
          // Create new profile if doesn't exist
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              email: data.email,
              zip_code: data.zipCode,
              role: 'customer',
              created_at: new Date().toISOString(),
              onboarded: false
            })
            .select()
            .single();

          if (profileError) {
            throw new Error('Failed to create profile');
          }
          profileId = profile.id;
        }

        // Subscribe to newsletter list
        const { error: subscriptionError } = await supabase
          .from('profile_list_subscriptions')
          .upsert({
            profile_id: profileId,
            list_id: process.env.NEXT_PUBLIC_NEWSLETTER_LIST_ID!,
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null
          }, {
            onConflict: 'profile_id,list_id'
          });

        if (subscriptionError) {
          console.error('Subscription error:', subscriptionError);
          throw new Error('Failed to subscribe to newsletter');
        }

        setIsOutOfArea(false);
        setZipCodeStatus(zipCodeData.is_active);
        setIsSuccess(true);
        
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to sign up');
      }
    }
  });

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-muted/50 via-background to-muted/50 p-4">
        <div className="max-w-md mx-auto" style={{ paddingTop: '15vh' }}>
          <div className="flex flex-col items-center mb-4">
            <div className="mb-6">
              <Image
                src={process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/assets/logo/logo.svg"}
                alt="Nearish Logo"
                width={240}
                height={70}
                className="h-20 w-auto"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-center">
              Nearish Chattanooga Newsletter
            </h1>
          </div>

          <Card className="mb-4">
            <CardContent className="text-center py-4">
              {!isSuccess ? (
                <h2 className="text-foreground font-medium text-lg">
                  A weekly summary of deals from local Chattanooga businesses nearest you.
                </h2>
              ) : (
                <h2 className="text-black font-medium text-xl">
                  {isOutOfArea 
                    ? "It looks like you're not in the Chattanooga metro area. But don't worry, Nearish is growing fast."
                    : zipCodeStatus === false
                    ? "You're all set! Your neighborhood hasn't gone live yet, but it's almost ready. Confirm your email so you don't miss the first issue."
                    : "Thanks for signing up! Check your email to confirm your subscription."
                  }
                </h2>
              )}
            </CardContent>
          </Card>

          {!isSuccess && (
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                if (!isChecked) {
                  toast.error("Please confirm you're human");
                  return;
                }
                createProfile.mutate({ email, zipCode });
              }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="human" 
                  checked={isChecked}
                  onCheckedChange={(checked) => setIsChecked(checked === true)}
                />
                <label
                  htmlFor="human"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I'm human
                </label>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="zipCode"
                    className="text-sm font-medium leading-none"
                  >
                    ZIP Code (for relevance)
                  </label>
                  <Input
                    id="zipCode"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    pattern="[0-9]{5}"
                    maxLength={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createProfile.isPending}>
                  {createProfile.isPending ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}