import type { ChatMessage } from '@/types/chat';

interface MemoryStoreState {
  [sessionId: string]: ChatMessage[];
}

const globalMemory = globalThis as typeof globalThis & { __RAG_MEMORY_STORE__?: MemoryStoreState };

export class MemoryStore {
  private store: MemoryStoreState;

  constructor() {
    if (!globalMemory.__RAG_MEMORY_STORE__) {
      globalMemory.__RAG_MEMORY_STORE__ = {};
    }
    this.store = globalMemory.__RAG_MEMORY_STORE__;
  }

  get(sessionId: string) {
    return this.store[sessionId] ?? [];
  }

  add(sessionId: string, message: ChatMessage) {
    if (!this.store[sessionId]) {
      this.store[sessionId] = [];
    }
    this.store[sessionId].push(message);
  }

  clear(sessionId: string) {
    delete this.store[sessionId];
  }
}

export const memoryStore = new MemoryStore();
