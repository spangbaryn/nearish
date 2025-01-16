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
import { toast } from "sonner";
import { addBusinessMember } from "@/lib/business";

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
    try {
      setSteps(prev => ({ ...prev, [stepNumber]: true }));
      
      if (stepNumber === 3) {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarded: true })
          .eq('id', user!.id);

        if (error) throw error;
        router.push('/home');
      } else {
        setCurrentStep(stepNumber + 1);
      }
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error('Failed to complete step. Please try again.');
      setSteps(prev => ({ ...prev, [stepNumber]: false }));
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
            try {
              // Insert directly into businesses table
              const { data: business, error: businessError } = await supabase
                .from('businesses')
                .insert({
                  name: businessDetails.name,
                  place_id: businessDetails.place_id,
                  formatted_address: businessDetails.formatted_address,
                  phone_number: businessDetails.phone_number,
                  website: businessDetails.website,
                })
                .select()
                .single();

              if (businessError) throw businessError;
              
              // Add the current user as a business member with owner role
              await addBusinessMember(business.id, user!.id, 'owner');
              
              completeStep(2);
            } catch (error: any) {
              console.error('Error saving business:', error);
              toast.error(error.message || 'Failed to save business details');
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
                 "Your Role"}
              </CardTitle>
            </div>
            <CardDescription>
              {step === 1 ? "Please select all that apply. \"My business is ...\"" :
               step === 2 ? "Search and select your business below." :
               "This is the final step to getting your account perfected."}
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