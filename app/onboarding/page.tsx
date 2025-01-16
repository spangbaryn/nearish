"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
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
                {step === 1 ? "Basic Information" :
                 step === 2 ? "Notifications" :
                 "Preferences"}
              </CardTitle>
            </div>
            <CardDescription>
              {step === 1 ? "Let's get to know you better" :
               step === 2 ? "Choose how you want to be notified" :
               "Customize your experience"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === step && (
              <Button 
                className="w-full" 
                onClick={() => completeStep(step)}
              >
                {step === 3 ? "Complete Setup" :
                 step === 2 ? "Set Up Notifications" :
                 "Complete Basic Info"}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}