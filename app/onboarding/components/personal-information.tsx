"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const handleSubmit = () => {
    if (!firstName || !lastName || !position) return;
    
    onComplete({
      firstName,
      lastName,
      position,
      isOwner: position.toLowerCase() === "owner"
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>
      </div>

      <Button 
        className="w-full" 
        disabled={!firstName || !lastName || !position}
        onClick={handleSubmit}
      >
        Complete
      </Button>
    </div>
  );
} 