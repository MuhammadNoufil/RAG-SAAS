export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

export interface SearchResult {
  id: string;
  score: number;
  text: string;
  source: string;
  chunkIndex: number;
}
