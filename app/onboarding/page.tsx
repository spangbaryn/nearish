"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { BusinessQualification } from "./components/business-qualification";
import { BusinessSearch } from "./components/business-search";
import { supabase as serverSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PersonalInformation } from "./components/personal-information";
import type { BusinessRole } from '@/types/auth';
import { BusinessService } from "@/lib/services/business.service";
import { extractDominantColor } from "../lib/utils/color";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

type Steps = {
  [key: number]: boolean;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<Steps>({
    1: false,
    2: false,
    3: false
  });
  const [businessName, setBusinessName] = useState<string>("");
  const [businessId, setBusinessId] = useState<string>("");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!user && !isLoading) {
      router.replace('/auth/login');
      return;
    }

    if (!isLoading) {
      setPageLoading(false);
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    
    const checkOnboarding = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', user.id)
        .single();

      if (profile?.onboarded) {
        router.push('/home');
      }
    };

    checkOnboarding();
  }, [user, router]);

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

  const handleBusinessSetup = async (businessDetails: any) => {
    try {
      if (!businessDetails.id) throw new Error('Business ID is required');
      
      // Extract dominant color from website favicon
      let brandColor = '#000000';
      if (businessDetails.website) {
        const faviconUrl = `${businessDetails.website}/favicon.ico`;
        // We'll implement this function next
        brandColor = await extractDominantColor(faviconUrl);
      }
      
      // Update business with brand color
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ brand_color: brandColor })
        .eq('id', businessDetails.id);

      if (updateError) throw updateError;
      
      await BusinessService.createBusinessMember(businessDetails.id, user!.id, 'owner');
      
      setBusinessName(businessDetails.name);
      setBusinessId(businessDetails.id);
      
      completeStep(2);
    } catch (error: any) {
      console.error('Error in business setup:', error);
      toast.error(error.message || 'Failed to setup business');
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
          onComplete={handleBusinessSetup}
        />
      );
    }
    if (step === 3) {
      return (
        <PersonalInformation 
          businessName={businessName}
          onComplete={async (data) => {
            try {
              // First update the profile with personal information
              const { error: profileError } = await supabase
                .from('profiles')
                .update({ 
                  first_name: data.firstName,
                  last_name: data.lastName,
                  onboarded: true
                })
                .eq('id', user!.id);

              if (profileError) throw profileError;

             
              
              completeStep(3);
            } catch (error: any) {
              console.error('Error saving personal information:', error);
              toast.error(error.message || 'Failed to save personal information');
            }
          }}
        />
      );
    }
  };

  if (pageLoading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <div className="w-full max-w-[600px] relative">
      {[1, 2, 3].map((step) => !steps[step] && (
        <Card 
          key={step}
          className={cn(
            "absolute left-1/2 rounded-lg shadow-lg transition-all duration-300",
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