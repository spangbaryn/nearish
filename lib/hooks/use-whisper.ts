import { useState, useCallback } from 'react';

export function useWhisper() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(async (audioBlob: Blob): Promise<string> => {
    try {
      setIsTranscribing(true);
      setError(null);

      // Dynamically import transformers
      const { pipeline, env } = await import('@xenova/transformers');
      
      // Configure WASM
      env.backends.onnx.wasm.numThreads = 1;

      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioData = new Float32Array(arrayBuffer);

      const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small', {
        quantized: true,
        progress_callback: undefined
      });

      const result = await transcriber(audioData, {
        chunk_length_s: 30,
        stride_length_s: 5
      });

      return typeof result === 'string' ? result : result.text || '';
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