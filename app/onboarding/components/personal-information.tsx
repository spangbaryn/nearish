"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

interface PersonalInformationProps {
  businessName: string;
  onComplete: (data: {
    firstName: string;
    lastName: string;
    position: string;
    isOwner: boolean;
  }) => void;
}

export function PersonalInformation({ businessName, onComplete }: PersonalInformationProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  const handleSubmit = () => {
    if (!firstName || !lastName || !position || isOwner === null) return;
    
    onComplete({
      firstName,
      lastName,
      position,
      isOwner
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Manager"
          />
        </div>

        <div className="space-y-2">
          <Label>Are you an owner of {businessName}?</Label>
          <RadioGroup
            value={isOwner?.toString()}
            onValueChange={(value) => setIsOwner(value === "true")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="owner-yes" />
              <Label htmlFor="owner-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="owner-no" />
              <Label htmlFor="owner-no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Button 
        className="w-full" 
        disabled={!firstName || !lastName || !position || isOwner === null}
        onClick={handleSubmit}
      >
        Complete
      </Button>
    </div>
  );
} 