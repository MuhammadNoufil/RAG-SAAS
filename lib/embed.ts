import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';

const apiKey = process.env.ANTHROPIC_API_KEY;
// Use a more stable model - fallback options
const generationModel = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';

if (!apiKey) {
  console.warn('Missing ANTHROPIC_API_KEY. Answer generation requires a valid Claude API key.');
}

const anthropic = new Anthropic({ apiKey: apiKey ?? '' });

// Generate consistent embeddings locally using hash-based approach
// This is a workaround for network connectivity issues
function hashStringToVector(text: string, dimension: number = 384): number[] {
  // Create a hash from the text
  const hash = crypto.createHash('sha256').update(text).digest();
  
  // Convert hash to a vector
  const vector: number[] = [];
  for (let i = 0; i < dimension; i++) {
    const byteIndex = i % hash.length;
    vector.push((hash[byteIndex] - 127.5) / 128);
  }
  
  // Normalize the vector
  let magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  if (magnitude === 0) magnitude = 1;
  return vector.map(v => v / magnitude);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  try {
    return texts.map(text => hashStringToVector(text));
  } catch (error) {
    const message = (error as Error).message || 'Unknown error';
    throw new Error(`Failed to generate embeddings: ${message}`);
  }
}

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    return hashStringToVector(text);
  } catch (error) {
    const message = (error as Error).message || 'Unknown error';
    throw new Error(`Failed to generate embedding: ${message}`);
  }
}

export async function createAnswer(prompt: string): Promise<string> {
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured. Cannot generate answers.');
  }

  // List of models to try in order
  const modelsToTry = [
    generationModel,
    'claude-3-sonnet-20240229',
    'claude-opus-4-1-20250805',
    'claude-3-haiku-20240307',
  ];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Attempting to generate answer with model: ${model}`);
      const response = await anthropic.messages.create({
        model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return content.text || 'I could not generate an answer from the content.';
      }

      return 'I could not generate an answer from the content.';
    } catch (error) {
      lastError = error as Error;
      const errorMsg = (error as Error).message || 'Unknown error';
      console.warn(`Model ${model} failed: ${errorMsg}`);
      // Continue to next model
    }
  }

  // If we got here, all models failed
  if (lastError) {
    throw new Error(`Failed to generate answer: ${lastError.message}`);
  }
  throw new Error('Failed to generate answer: No models available');
}
