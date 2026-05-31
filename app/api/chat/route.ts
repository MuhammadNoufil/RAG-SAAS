import { NextResponse } from 'next/server';
import { buildPrompt, searchDocuments } from '@/lib/hybridSearch';
import { createAnswer } from '@/lib/embed';
import type { ChatMessage } from '@/types/chat';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question = String(body.question ?? '').trim();
    const history = Array.isArray(body.history) ? (body.history as ChatMessage[]) : [];

    if (!question) {
      return NextResponse.json({ error: 'Please ask a valid question.' }, { status: 400 });
    }

    const searchResults = await searchDocuments(question, 5);
    const prompt = buildPrompt(question, searchResults, history);
    const answer = await createAnswer(prompt);

    return NextResponse.json({
      answer,
      citations: searchResults,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Chat failed' }, { status: 500 });
  }
}
