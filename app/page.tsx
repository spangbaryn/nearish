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

      const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      
      try {
        const user = await AuthService.signUp(email, password);
        
        // Update zip code after profile is created
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ zip_code: data.zipCode })
          .eq('id', user.id);

        if (updateError) throw new AuthError('Failed to update zip code');

        setIsOutOfArea(false);
        setZipCodeStatus(zipCodeData.is_active);
        setIsSuccess(true);
        return { user };
      } catch (error) {
        if (error instanceof AuthError && error.message.includes('already registered')) {
          throw new AuthError('This email is already registered. Please use a different email address.');
        }
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result?.user) {
        toast.success("Thanks! I'll be in touch soon. 🙌");
      }
    }
  });

  return (
    <div>
      <div className="min-h-screen bg-muted/15 p-4">
        <div className="max-w-md mx-auto py-4">
          <div className="flex flex-col items-center mb-4">
            <h1 className="text-2xl font-bold text-center">
              Nearish Chattanooga Newsletter
            </h1>
          </div>

          <Card className="mb-4">
            <CardContent className="text-center py-4">
              {!isSuccess ? (
                <h2 className="text-foreground font-medium text-lg">
                  A weekly summary of deals from {' '}
                  <span className="bg-[linear-gradient(70deg,#ff0000,#ff8800,#ffd700,#248f47,#33bbff,#8A2BE2)] text-transparent bg-clip-text">
                    local
                  </span>
                  {' '}Chattanooga ❤️ businesses
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
                  toast.error("Please verify you're human")
                  return
                }
                createProfile.mutate({ email, zipCode })
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