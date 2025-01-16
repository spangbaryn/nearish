import { useState, useEffect } from 'react';

declare global {
  interface Window {
    google: typeof google;
    googlePlacesPromise?: Promise<void>;
  }
}

let scriptLoadPromise: Promise<void> | null = null;

export function useGooglePlaces() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    if (!scriptLoadPromise) {
      scriptLoadPromise = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => {
          setIsLoaded(true);
          resolve();
        };
        script.onerror = () => {
          const error = new Error('Failed to load Google Places API');
          setError(error);
          reject(error);
          scriptLoadPromise = null;
        };
        document.head.appendChild(script);
      });
    }

    scriptLoadPromise.then(() => setIsLoaded(true)).catch((err) => setError(err));

    return () => {
      // Don't remove the script on unmount, just clean up state
      setIsLoaded(false);
      setError(null);
    };
  }, []);

  return { isLoaded, error };
} 