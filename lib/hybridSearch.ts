import { getEmbedding } from '@/lib/embed';
import { queryEmbeddings } from '@/lib/pinecone';
import type { ChatMessage, SearchResult } from '@/types/chat';

export async function searchDocuments(question: string, topK = 5): Promise<SearchResult[]> {
  const queryVector = await getEmbedding(question);
  return await queryEmbeddings(queryVector, topK);
}

export function buildPrompt(question: string, results: SearchResult[], history: ChatMessage[]) {
  const context = results
    .map(
      (result, index) =>
        `Source ${index + 1}: ${result.source}\n${result.text.trim().slice(0, 360)}${result.text.length > 360 ? '...' : ''}`,
    )
    .join('\n\n');

  const conversation = history
    .filter((item) => item.role !== 'system')
    .map((item) => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.text}`)
    .join('\n');

  return [
    'You are a helpful assistant that answers questions using the provided document excerpts. If the answer is not contained within the sources, say that you do not know.',
    '',
    'Document context:',
    context || 'No document context is available.',
    '',
    'Conversation so far:',
    conversation,
    '',
    `User: ${question}`,
    'Assistant:',
  ]
    .filter(Boolean)
    .join('\n');
}
