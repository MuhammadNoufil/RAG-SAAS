import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_API_KEY;
const embeddingModel = process.env.GOOGLE_EMBEDDING_MODEL ?? 'textembedding-gecko-001';
const generationModel = process.env.GOOGLE_GEN_MODEL ?? 'text-bison-001';

if (!apiKey) {
  console.warn('Missing GOOGLE_API_KEY. Document indexing and answer generation require a valid key.');
}

const googleAI = new GoogleGenerativeAI(apiKey ?? '');

function getModel(modelName: string) {
  return googleAI.getGenerativeModel({ model: modelName });
}

function extractText(response: any): string {
  const candidate = response?.response?.candidates?.[0];
  if (!candidate) return '';
  const parts = candidate.content?.parts ?? [];
  return parts.map((part: any) => part.text ?? '').join('').trim();
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

  return response.embeddings.map((embedding: any) => embedding.embedding.values);
}

export async function getEmbedding(text: string): Promise<number[]> {
  const model = getModel(embeddingModel);
  const response = await model.embedContent(text);
  return response.embedding.values;
}

export async function createAnswer(prompt: string): Promise<string> {
  const model = getModel(generationModel);
  const response = await model.generateContent(prompt);
  return extractText(response) || 'I could not generate an answer from the content.';
}
