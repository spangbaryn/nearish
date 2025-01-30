import { useState, useCallback } from 'react';
import { AppError } from '@/lib/errors';
import { toast } from '@/components/ui/use-toast';

const TRANSCRIPTION_SERVICE = process.env.NEXT_PUBLIC_TRANSCRIPTION_URL || 'http://localhost:3001';

export function useWhisper() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (audioBlob: Blob): Promise<string> => {
    try {
      setIsTranscribing(true);
      setError(null);

      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch(`${TRANSCRIPTION_SERVICE}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new AppError('TranscriptionError', 'Failed to transcribe audio');
      }

      const { text } = await response.json();
      return text;
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Failed to transcribe audio';
      setError(message);
      toast({
        variant: "destructive",
        title: "Transcription Error",
        description: message
      });
      throw err;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  return {
    transcribe,
    isTranscribing,
    error
  };
} 