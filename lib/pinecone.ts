import { Pinecone } from '@pinecone-database/pinecone';
import { cosineSimilarity } from './vector';
import type { SearchResult } from '@/types/chat';

export interface LocalVectorRecord {
  id: string;
  values: number[];
  metadata: {
    source: string;
    text: string;
    chunkIndex: number;
  };
}

const usePinecone =
  process.env.PINECONE_USE?.toLowerCase() === 'true' &&
  Boolean(process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME);

let pineconeClient: Pinecone | null = null;
let pineconeIndex: any = null;

function getLocalStore(): LocalVectorRecord[] {
  const globalStore = globalThis as typeof globalThis & { __RAG_LOCAL_VECTOR_STORE__?: LocalVectorRecord[] };
  if (!globalStore.__RAG_LOCAL_VECTOR_STORE__) {
    globalStore.__RAG_LOCAL_VECTOR_STORE__ = [];
  }
  return globalStore.__RAG_LOCAL_VECTOR_STORE__;
}

async function getIndex() {
  if (!usePinecone) return null;
  if (pineconeIndex) return pineconeIndex;

  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME;
  const controllerHostUrl = process.env.PINECONE_CONTROLLER_HOST;

  if (!apiKey || !indexName) {
    return null;
  }

  pineconeClient = new Pinecone({
    apiKey,
    ...(controllerHostUrl ? { controllerHostUrl } : {}),
  });

  pineconeIndex = pineconeClient.index(indexName);
  return pineconeIndex;
}

export async function upsertEmbeddings(records: LocalVectorRecord[]) {
  if (records.length === 0) {
    return;
  }

  if (usePinecone) {
    const index = await getIndex();
    if (!index) throw new Error('Unable to initialize Pinecone index.');

    try {
      await index.upsert({ records: records.map((record) => ({ id: record.id, values: record.values, metadata: record.metadata })) });
    } catch (error) {
      if (error instanceof Error && /dimension/i.test(error.message)) {
        throw new Error(
          'Pinecone index dimension mismatch. This app currently produces 3072-dimensional embeddings; create the Pinecone index with dimension 3072 or disable Pinecone by setting PINECONE_USE=false.',
        );
      }
      throw error;
    }
    return;
  }

  const localStore = getLocalStore();
  localStore.push(...records);
}

export async function queryEmbeddings(queryVector: number[], topK = 5): Promise<SearchResult[]> {
  if (usePinecone) {
    const index = await getIndex();
    if (!index) return [];

    const results = await index.query({
      queryRequest: {
        topK,
        vector: queryVector,
        includeMetadata: true,
        includeValues: false,
      },
    });

    return (results.matches ?? []).map((match: any) => ({
      id: match.id,
      score: match.score ?? 0,
      text: String(match.metadata?.text ?? '').slice(0, 560),
      source: String(match.metadata?.source ?? 'Unknown source'),
      chunkIndex: Number(match.metadata?.chunkIndex ?? 0),
    }));
  }

  const localStore = getLocalStore();
  const ranked = localStore
    .map((record) => ({
      id: record.id,
      score: cosineSimilarity(record.values, queryVector),
      text: record.metadata.text,
      source: record.metadata.source,
      chunkIndex: record.metadata.chunkIndex,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return ranked;
}
