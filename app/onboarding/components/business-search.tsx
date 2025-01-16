"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Phone, Globe } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useGooglePlaces } from "@/lib/hooks/use-google-places";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BusinessDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  phone_number?: string;
  website?: string;
}

interface BusinessSearchProps {
  onComplete: (businessDetails: BusinessDetails) => void;
}

export function BusinessSearch({ onComplete }: BusinessSearchProps) {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessDetails | null>(null);
  const { isLoaded, error } = useGooglePlaces();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = useCallback(async (value: string) => {
    setSearch(value);
    if (!value || !isLoaded || !window.google?.maps?.places) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const service = new window.google.maps.places.AutocompleteService();
      const response = await service.getPlacePredictions({
        input: value,
        types: ['establishment'],
        componentRestrictions: { country: 'us' }
      });
      
      if (response && response.predictions) {
        setSuggestions(response.predictions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Failed to fetch business suggestions');
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [isLoaded]);

  const handleSelectBusiness = useCallback(async (placeId: string) => {
    if (!isLoaded || !window.google?.maps?.places) return;
    
    setIsSearching(true);
    try {
      const service = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      const place = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        service.getDetails(
          { 
            placeId, 
            fields: ['name', 'formatted_address', 'formatted_phone_number', 'website'] 
          },
          (result, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
              resolve(result);
            } else {
              reject(new Error('Failed to fetch place details'));
            }
          }
        );
      });

      const businessDetails: BusinessDetails = {
        place_id: placeId,
        name: place.name!,
        formatted_address: place.formatted_address!,
        phone_number: place.formatted_phone_number,
        website: place.website
      };

      setSelectedBusiness(businessDetails);
      setSuggestions([]);
      setSearch(place.name!);
    } catch (error) {
      console.error('Error fetching place details:', error);
      toast.error('Failed to fetch business details');
    } finally {
      setIsSearching(false);
    }
  }, [isLoaded]);

  const handleComplete = async () => {
    if (!selectedBusiness) return;
    
    setIsSubmitting(true);
    try {
      await onComplete(selectedBusiness);
    } catch (error) {
      console.error('Error saving business:', error);
      toast.error('Failed to save business details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Failed to load business search. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for your business..."
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        
        {suggestions.length > 0 && (
          <Card className="absolute w-full mt-1 z-50">
            <CardContent className="p-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  className={cn(
                    "w-full text-left px-2 py-2 rounded-md hover:bg-muted",
                    "transition-colors duration-200"
                  )}
                  onClick={() => handleSelectBusiness(suggestion.place_id)}
                >
                  {suggestion.structured_formatting.main_text}
                  <span className="text-sm text-muted-foreground block">
                    {suggestion.structured_formatting.secondary_text}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {selectedBusiness && (
        <Card className="mt-4">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-lg">{selectedBusiness.name}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {selectedBusiness.formatted_address}
              </div>
              {selectedBusiness.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {selectedBusiness.phone_number}
                </div>
              )}
              {selectedBusiness.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {selectedBusiness.website}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Button 
        className="w-full mt-4" 
        disabled={!selectedBusiness || isSubmitting}
        onClick={handleComplete}
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" />
            Saving...
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </div>
  );
} 