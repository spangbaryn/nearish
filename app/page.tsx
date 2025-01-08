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

export default function Home() {
  const [email, setEmail] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isChecked, setIsChecked] = useState(false)

  const createProfile = useMutation({
    mutationFn: async (data: { email: string; zipCode: string }) => {
      const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);

      try {
        // First create auth user
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

        // Create profile immediately
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

        return authData.user;
      } catch (error: any) {
        const message = error instanceof AuthError ? error.message : 'Something went wrong. Please try again.';
        toast.error(message);
        throw error;
      }
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Thanks! I'll be in touch soon. 🙌");
    }
  });

  return (
    <div>
      <div className="min-h-screen bg-muted-15 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="flex flex-col items-center mb-8">
            <img 
              src="https://ufkjyykwialeflrgutef.supabase.co/storage/v1/object/public/assets/logo/logo.svg" 
              alt="Nearish Logo" 
              className="w-32 mb-4"
            />
            <h1 className="text-2xl font-bold text-center">
              Nearish Chattanooga Newsletter
            </h1>
          </div>

          <Card className="mb-8">
            <CardContent className="text-center pt-6">
              <h2 className="text-black font-medium text-2xl">
                Your weekly summary of deals from {' '}
                <span className="bg-[linear-gradient(40deg,#ff0000,#ffff00,#248f47,#33bbff)] text-transparent bg-clip-text">
                local </span>Chattanooga businesses
                
              </h2>
            </CardContent>
          </Card>

          {!isSuccess ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                if (!isChecked) {
                  toast.error("Please verify you're human")
                  return
                }
                createProfile.mutate({ email, zipCode })
              }}
              className="flex flex-col gap-4"
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
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                <Button type="submit" disabled={createProfile.isPending}>
                  {createProfile.isPending ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 text-center border border-green-100">
              <h3 className="text-xl font-medium text-green-800 mb-1">
                You're all set! 🎉
              </h3>
              <p className="text-green-600">
                You should receive a confirmation email shortly. If you happen to also operate a local business that wants to be included, check this out.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}