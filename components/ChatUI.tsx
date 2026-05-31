'use client';

import { useMemo, useState } from 'react';
import Citation from './Citation';
import Message from './Message';
import Sidebar from './Sidebar';
import UploadBox from './UploadBox';
import type { ChatMessage, SearchResult } from '@/types/chat';

const initialMessages: ChatMessage[] = [
  {
    id: 'system-intro',
    role: 'assistant',
    text: 'Upload a document and ask questions about its content. The AI will answer from the indexed sources.',
  },
];

export default function ChatUI() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [citations, setCitations] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState('Upload a file to begin.');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<string[]>([]);

  const hasDocuments = documents.length > 0;

  const sendQuestion = async () => {
    if (!question.trim()) return;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: question.trim(),
    };

    setMessages((current) => [...current, userMessage]);
    setLoading(true);
    setQuestion('');
    setStatus('Querying your documents...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage.text, history: [...messages, userMessage] }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Unable to fetch answer.');
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: data.answer || 'I could not generate a response right now.',
      };

      setMessages((current) => [...current, assistantMessage]);
      setCitations(data.citations ?? []);
      setStatus('Ready for your next question.');
    } catch (error) {
      const errorMessage = (error as Error).message || 'Unknown error';
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: `Oops — ${errorMessage}`,
        },
      ]);
      setStatus('Please try again or upload another document.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (fileName: string) => {
    setDocuments((current) => {
      if (current.includes(fileName)) return current;
      return [fileName, ...current];
    });
    setStatus(`Indexed ${fileName}. Ask a question now.`);
  };

  const canSubmit = Boolean(question.trim() && hasDocuments && !loading);

  const recentCitations = useMemo(() => citations.filter((item) => item.text && item.source), [citations]);

  return (
    <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">RAG SaaS Workspace</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Document-aware AI chat with modern controls</h1>
          <p className="max-w-2xl pt-4 text-slate-300 sm:text-lg">
            Upload PDFs, DOCX, or text files and ask questions using retrieval augmented generation. The app indexes your documents and answers with citations from the source text.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-3xl bg-slate-900/70 px-4 py-3 text-sm text-slate-300 shadow-xl shadow-slate-950/10">
            {status}
          </div>
          <div className="rounded-full bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-200 ring-1 ring-cyan-500/15">
            {hasDocuments ? `${documents.length} document${documents.length === 1 ? '' : 's'} indexed` : 'No documents yet'}
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Upload a document</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Supported formats: PDF, DOCX, TXT, HTML. The app extracts content, creates embeddings, and stores document chunks for search.
            </p>
            <UploadBox onUploadSuccess={handleUploadSuccess} />
          </div>

          <Sidebar documents={documents} />
        </aside>

        <section className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Chat with your content</h2>
                <p className="mt-1 text-sm text-slate-400">Ask questions and receive AI answers grounded in the documents you uploaded.</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className={loading ? 'inline-flex h-3 w-3 animate-pulse rounded-full bg-cyan-400' : 'inline-flex h-3 w-3 rounded-full bg-slate-700'} />
                {loading ? 'Thinking...' : 'Ready to answer'}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-300">Ask a question</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  rows={3}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={hasDocuments ? 'Ask about the uploaded documents...' : 'Upload a document to get started.'}
                  className="min-h-[120px] w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
                <button
                  type="button"
                  onClick={sendQuestion}
                  disabled={!canSubmit}
                  className="inline-flex h-14 items-center justify-center rounded-3xl bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-500/50"
                >
                  {loading ? 'Waiting...' : 'Send question'}
                </button>
              </div>
            </div>
          </div>

          {recentCitations.length > 0 && (
            <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">Source citations</h2>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">Grounded</span>
              </div>
              <div className="mt-4 grid gap-4">
                {recentCitations.map((citation) => (
                  <Citation key={citation.id} citation={citation} />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
