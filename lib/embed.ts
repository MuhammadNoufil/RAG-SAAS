import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY;
const apiVersion = process.env.GOOGLE_API_VERSION ?? 'v1';
const embeddingModel = process.env.GOOGLE_EMBEDDING_MODEL ?? 'gemini-embedding-001';
const generationModel = process.env.GOOGLE_GEN_MODEL ?? 'gemini-2.5-flash';

if (!apiKey) {
  console.warn('Missing GOOGLE_API_KEY. Document indexing and answer generation require a valid key.');
}

const googleAI = new GoogleGenerativeAI(apiKey ?? '');

function getModel(modelName: string) {
  return googleAI.getGenerativeModel({ model: modelName }, { apiVersion });
}

function extractText(response: any): string {
  const candidate = response?.response?.candidates?.[0];
  if (!candidate) return '';
  const parts = candidate.content?.parts ?? [];
  return parts.map((part: any) => part.text ?? '').join('').trim();
}

function getEmbeddingValues(response: any): number[] {
  const values = response?.values ?? response?.embedding?.values;
  if (!Array.isArray(values)) {
    throw new Error('Google embedding response missing values');
  }
  return values;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const model = getModel(embeddingModel);
  const response = await model.batchEmbedContents({
    requests: texts.map((text) => ({
      content: {
        role: 'user',
        parts: [{ text }],
      },
    })),
  });

  if (!Array.isArray(response.embeddings)) {
    throw new Error('Google batch embedding response missing embeddings');
  }

  return response.embeddings.map((embedding: any) => getEmbeddingValues(embedding));
}

export async function getEmbedding(text: string): Promise<number[]> {
  const model = getModel(embeddingModel);
  const response = await model.embedContent(text);
  return getEmbeddingValues(response);
}

export async function createAnswer(prompt: string): Promise<string> {
  const model = getModel(generationModel);
  const response = await model.generateContent(prompt);
  return extractText(response) || 'I could not generate an answer from the content.';
}
