/**
 * React hook for AI yokai generation
 */

import { useState } from 'react';
import { AIYokai } from '../../shared/types';

interface UseAIYokaiReturn {
  generateYokai: (prompt?: string) => Promise<AIYokai | null>;
  generateVariations: (prompt: string, count?: number) => Promise<AIYokai[]>;
  isGenerating: boolean;
  error: string | null;
}

export function useAIYokai(): UseAIYokaiReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateYokai = async (prompt?: string): Promise<AIYokai | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-yokai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate yokai');
      }

      const data = await response.json();
      return data.yokai;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('AI yokai generation failed:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVariations = async (prompt: string, count = 3): Promise<AIYokai[]> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, count }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate yokai variations');
      }

      const data = await response.json();
      return data.variations || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('AI yokai variations failed:', err);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateYokai,
    generateVariations,
    isGenerating,
    error,
  };
}