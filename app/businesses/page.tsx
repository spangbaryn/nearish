"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function BusinessLandingPage() {
  return (
    <div>
      <div className="min-h-screen bg-muted/15 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="flex flex-col items-center mb-8">
            <img 
              src={process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/assets/logo/logo.svg"}
              alt="Nearish Logo" 
              className="w-32 mb-4"
            />
            <h1 className="text-3xl font-bold text-center">
              Grow Your Local Business with Nearish
            </h1>
            <p className="text-xl text-muted-foreground mt-4 text-center">
              Connect with customers in your neighborhood and boost your local presence
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="text-center pt-6">
              <div className="grid gap-6 md:grid-cols-3 mb-8">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Local Reach</h3>
                  <p className="text-muted-foreground">Target customers in your specific neighborhood</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Social Integration</h3>
                  <p className="text-muted-foreground">Sync with your Facebook page automatically</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Weekly Deals</h3>
                  <p className="text-muted-foreground">Share promotions with engaged local customers</p>
                </div>
              </div>
              
              <Link href="/signup">
                <Button size="lg" className="w-full md:w-auto">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 