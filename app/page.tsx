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

      if (zipError && zipError.code !== 'PGRST116') { // Not a "not found" error
        throw new Error('Failed to check zip code');
      }

      // If zip code doesn't exist in our database
      if (!zipCodeData) {
        setIsOutOfArea(true);
        setIsSuccess(true);
        return null;
      }

      // Create auth user regardless of zip code status
      const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password,
        options: {
          data: { 
            role: 'customer',
            zip_code: data.zipCode 
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        if (authError.status === 409) {
          throw new AuthError('This email is already registered. Please use a different email address.');
        }
        throw new AuthError(authError.message);
      }
      if (!authData.user) throw new AuthError('No user data returned');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          role: 'customer',
          zip_code: data.zipCode
        })
        .single();

      if (profileError) throw new AuthError('Failed to create profile');

      // Set state based on zip code status
      setIsOutOfArea(false);
      setZipCodeStatus(zipCodeData.is_active);
      setIsSuccess(true);
      return { user: authData.user };
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
            <img 
              src="https://ufkjyykwialeflrgutef.supabase.co/storage/v1/object/public/assets/logo/logo.svg" 
              alt="Nearish Logo" 
              className="w-24 mb-2"
            />
            <h1 className="text-xl font-bold text-center">
              Nearish Chattanooga Newsletter
            </h1>
          </div>

          <Card className="mb-4">
            <CardContent className="text-center py-4">
              {!isSuccess ? (
                <h2 className="text-foreground font-medium text-xl">
                  Your weekly summary of deals from {' '}
                  <span className="bg-[linear-gradient(70deg,#ff0000,#ff8800,#ffd700,#248f47,#33bbff,#8A2BE2)] text-transparent bg-clip-text">
                    local
                  </span>
                  {' '}Chattanooga businesses
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