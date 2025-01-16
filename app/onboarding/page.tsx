"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BusinessQualification } from "./components/business-qualification";
import { BusinessSearch } from "./components/business-search";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState({
    1: false,
    2: false,
    3: false
  });

  const getCardWidth = (step: number) => {
    const stepsAhead = step - currentStep;
    if (stepsAhead === 0) return 'w-full';
    if (stepsAhead === 1) return 'w-[calc(100%-48px)]';
    return 'w-[calc(100%-96px)]';
  };

  const getCardOffset = (step: number) => {
    const stepsAhead = step - currentStep;
    if (stepsAhead <= 0) return 'translate(-50%, 0)';
    if (stepsAhead === 1) return 'translate(-50%, -12px)';
    return 'translate(-50%, -24px)';
  };

  const getZIndex = (step: number) => {
    return 30 - (step - currentStep);
  };

  const completeStep = async (stepNumber: number) => {
    setSteps(prev => ({ ...prev, [stepNumber]: true }));
    
    if (stepNumber === 3) {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarded: true })
        .eq('id', user!.id);

      if (!error) {
        router.push('/home');
      }
    } else {
      setCurrentStep(stepNumber + 1);
    }
  };

  const renderStepContent = (step: number) => {
    if (step === 1) {
      return (
        <BusinessQualification 
          onComplete={() => completeStep(1)} 
        />
      );
    }
    if (step === 2) {
      return (
        <BusinessSearch 
          onComplete={async (businessDetails) => {
            // Save business details to database
            const { error } = await supabase
              .from('businesses')
              .insert({
                owner_id: user!.id,
                name: businessDetails.name,
                place_id: businessDetails.place_id,
                address: businessDetails.formatted_address,
                phone: businessDetails.phone_number,
                website: businessDetails.website
              });

            if (!error) {
              completeStep(2);
            }
          }} 
        />
      );
    }
    // ... handle other steps ...
  };

  if (isLoading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <div className="w-full max-w-[600px] relative">
      {[1, 2, 3].map((step) => !steps[step] && (
        <Card 
          key={step}
          className={cn(
            "absolute left-1/2 bg-white rounded-lg shadow-lg transition-all duration-300",
            getCardWidth(step),
            "-translate-x-1/2",
            step === currentStep ? "opacity-100" : "opacity-85",
          )}
          style={{
            transform: getCardOffset(step),
            zIndex: getZIndex(step)
          }}
        >
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {step === 1 ? "Business Fit" :
                 step === 2 ? "Find Your Business" :
                 "Preferences"}
              </CardTitle>
            </div>
            <CardDescription>
              {step === 1 ? "Please select all that apply. \"My business is ...\"" :
               step === 2 ? "Search and select your business below." :
               "Customize your experience"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === step && renderStepContent(step)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}