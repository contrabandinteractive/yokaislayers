/**
 * AI-powered yokai generation service
 * Integrates with external AI APIs to create dynamic yokai content
 */

import { AIYokai } from '../shared/types.js';

export class AIYokaiService {
  private apiKey: string;
  private baseUrl: string;
  private lastRequestTime: number = 0;
  private minRequestInterval: number = 5000; // 5 seconds between requests

  constructor(apiKey: string, baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Generate a new yokai using AI
   */
  async generateYokai(prompt?: string): Promise<AIYokai> {
    // Rate limiting
    const now = Date.now();
    if (now - this.lastRequestTime < this.minRequestInterval) {
      console.log('Rate limit hit, using fallback yokai');
      return this.getFallbackYokai();
    }
    this.lastRequestTime = now;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert in Japanese mythology and folklore. Generate a unique yokai (supernatural creature) with authentic Japanese cultural elements. Return ONLY valid JSON in this exact format:
{
  "name": "English name",
  "nameJP": "Japanese name in hiragana/katakana/kanji",
  "description": "Brief description for gameplay",
  "backstory": "Rich mythological background",
  "imageUrl": "placeholder-image-url",
  "hp": 150000,
  "defense": 20,
  "attackPattern": [15, 20, 18, 25, 22]
}`
            },
            {
              role: 'user',
              content: prompt || 'Create a unique yokai for a community RPG battle game'
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from AI API');
      }

      // Parse the JSON response
      const yokai = JSON.parse(content) as AIYokai;
      
      // Validate required fields
      if (!yokai.name || !yokai.nameJP || !yokai.hp || !yokai.attackPattern) {
        throw new Error('Invalid yokai data received from AI');
      }

      return yokai;
    } catch (error) {
      console.error('Failed to generate AI yokai:', error);
      
      // Fallback to a default yokai if AI fails
      return this.getFallbackYokai();
    }
  }

  /**
   * Generate multiple yokai variations
   */
  async generateYokaiVariations(basePrompt: string, count: number = 3): Promise<AIYokai[]> {
    const promises = Array.from({ length: count }, (_, i) => 
      this.generateYokai(`${basePrompt} - Variation ${i + 1}`)
    );

    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<AIYokai> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  /**
   * Fallback yokai when AI generation fails
   */
  private getFallbackYokai(): AIYokai {
    return {
      name: "Mysterious Shadow",
      nameJP: "謎の影",
      description: "A mysterious shadow creature that emerged from the void",
      backstory: "When AI spirits fail to manifest, this shadow appears in their place",
      imageUrl: "/oni.jpg", // Using oni as fallback since it's a generic yokai
      hp: 150000,
      defense: 20,
      attackPattern: [18, 22, 20, 24, 21]
    };
  }
}

/**
 * Create AI yokai service instance
 */
export function createAIYokaiService(): AIYokaiService | null {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not found - AI yokai generation disabled');
    return null;
  }

  return new AIYokaiService(apiKey);
}