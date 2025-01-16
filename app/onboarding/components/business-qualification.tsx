"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Building2, Hospital, Home, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface QualificationOption {
  id: string;
  label: string;
  icon: React.ElementType;
}

const qualificationOptions: QualificationOption[] = [
  { id: 'not-franchise', label: 'Not a franchise', icon: Store },
  { id: 'not-bigbox', label: 'Not a big box store', icon: Building2 },
  { id: 'not-medical', label: 'Not a medical clinic or pharmacy', icon: Hospital },
  { id: 'locally-owned', label: 'Is locally owned and operated', icon: Home },
  { id: 'physical-location', label: 'Has a physical location', icon: MapPin },
];

interface BusinessQualificationProps {
  onComplete: () => void;
}

export function BusinessQualification({ onComplete }: BusinessQualificationProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

  const toggleOption = (id: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedOptions(newSelected);
  };

  const isComplete = selectedOptions.size === qualificationOptions.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {qualificationOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedOptions.has(option.id);
          
          return (
            <Card
              key={option.id}
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md",
                "border-2",
                isSelected ? "border-primary bg-primary/5" : "border-transparent"
              )}
              onClick={() => toggleOption(option.id)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{option.label}</span>
                {isSelected && (
                  <Check className="h-4 w-4 ml-auto text-primary" />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Button 
        className="w-full" 
        disabled={!isComplete}
        onClick={onComplete}
      >
        Continue
      </Button>
    </div>
  );
} 