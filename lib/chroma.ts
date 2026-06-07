import type { SearchResult } from '@/types/chat';

export interface ChromaVector {
  id: string;
  values: number[];
  metadata: {
    source: string;
    text: string;
    chunkIndex: number;
  };
}

// Use globalThis to survive Next.js hot reloads in development
const getVectorStore = () => {
  if (!globalThis.vectorStore) {
    globalThis.vectorStore = new Map<string, ChromaVector>();
    console.log('[Vector Store] Initialized new vector store');
  }
  return globalThis.vectorStore as Map<string, ChromaVector>;
};

// Cosine similarity function
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

export async function upsertEmbeddings(vectors: ChromaVector[]): Promise<void> {
  if (vectors.length === 0) {
    return;
  }
  const vectorStore = getVectorStore();
  console.log(`[Memory] Upserting ${vectors.length} vectors`);
  vectors.forEach((vector) => {
    vectorStore.set(vector.id, vector);
  });
}

export async function queryEmbeddings(queryVector: number[], topK = 5): Promise<SearchResult[]> {
  const vectorStore = getVectorStore();
  const results: Array<{ id: string; score: number; vector: ChromaVector }> = [];

  // Calculate similarity with all vectors
  vectorStore.forEach((vector) => {
    const score = cosineSimilarity(queryVector, vector.values);
    results.push({ id: vector.id, score, vector });
  });

  // Sort by score descending and take top K
  const topResults = results
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  
  console.log(`[Vector Store] Query returned ${topResults.length}/${vectorStore.size} vectors, topK=${topK}`);
  
  return topResults.map((r) => ({
    id: r.id,
    score: r.score,
    text: r.vector.metadata.text.slice(0, 560),
    source: r.vector.metadata.source,
    chunkIndex: r.vector.metadata.chunkIndex,
  }));
}

export async function getAllVectors(): Promise<SearchResult[]> {
  const vectorStore = getVectorStore();
  const results: SearchResult[] = [];
  console.log(`[getAllVectors] vectorStore.size = ${vectorStore.size}`);
  vectorStore.forEach((vector, key) => {
    console.log(`[getAllVectors] Found vector ${key}: source=${vector.metadata.source}`);
    results.push({
      id: vector.id,
      score: 0,
      text: vector.metadata.text.slice(0, 560),
      source: vector.metadata.source,
      chunkIndex: vector.metadata.chunkIndex,
    });
  });
  console.log(`[getAllVectors] Returning ${results.length} total vectors`);
  return results;
}

export async function deleteDocument(documentId: string): Promise<void> {
  const vectorStore = getVectorStore();
  let deletedCount = 0;
  const keysToDelete: string[] = [];
  
  vectorStore.forEach((vector, key) => {
    if (vector.metadata.source === documentId) {
      keysToDelete.push(key);
      deletedCount++;
    }
  });
  
  keysToDelete.forEach((key) => vectorStore.delete(key));
  console.log(`[Memory] Deleted ${deletedCount} vectors for document: ${documentId}`);
}

export async function getAllDocuments(): Promise<string[]> {
  const vectorStore = getVectorStore();
  const sources = new Set<string>();
  
  vectorStore.forEach((vector) => {
    sources.add(vector.metadata.source);
  });

  return Array.from(sources);
}
