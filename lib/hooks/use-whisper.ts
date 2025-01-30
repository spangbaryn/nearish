import { useState, useCallback } from 'react';

export function useWhisper() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (audioBlob: Blob): Promise<string> => {
    try {
      setIsTranscribing(true);
      setError(null);

      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const { text } = await response.json();
      return text;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transcribe audio');
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