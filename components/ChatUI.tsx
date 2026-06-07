'use client';

import { useEffect, useMemo, useState } from 'react';
import AOS from 'aos';
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

  useEffect(() => {
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, mirror: false });
  }, []);

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

  const handleDocumentDelete = (documentId: string) => {
    setDocuments((current) => current.filter((doc) => doc !== documentId));
    setStatus(`${documentId} has been removed from your workspace.`);
  };

  const canSubmit = Boolean(question.trim() && hasDocuments && !loading);
  const recentCitations = useMemo(() => citations.filter((item) => item.text && item.source), [citations]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
        <section data-aos="slide-up" data-aos-duration="1200" className="overflow-hidden rounded-[40px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl sm:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.45fr_0.85fr] xl:items-center">
            <div data-aos="slide-down" data-aos-duration="1100" className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 ring-1 ring-cyan-400/20">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                Retrieval-Augmented Generation
              </div>
              <div className="space-y-4">
                <h1 data-aos="slide-right" data-aos-delay="120" data-aos-duration="1200" className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl text-glow">Modern document chat with smarter responses</h1>
                <p data-aos="slide-right" data-aos-delay="240" data-aos-duration="1300" className="max-w-2xl text-lg leading-8 text-slate-300">
                  Upload PDFs, DOCX, TXT, or HTML files and let Claude answer questions from your own knowledge base. The interface is fully responsive, clean, and optimized for fast workflows.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div data-aos="fade-right" className="animate-float rounded-[28px] border border-slate-800/80 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/10">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Indexed documents</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{documents.length}</p>
                </div>
                <div data-aos="fade-left" className="animate-float rounded-[28px] border border-slate-800/80 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/10">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Conversation history</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{messages.length}</p>
                </div>
              </div>
            </div>

            <div data-aos="fade-left" className="grid gap-4 rounded-[32px] border border-slate-800/70 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/20">
              <div data-aos="fade-up" data-aos-delay="80" className="rounded-[32px] bg-slate-950/90 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Workspace status</p>
                <p className="mt-3 text-xl font-semibold text-white">{status}</p>
              </div>
              <div data-aos="fade-up" data-aos-delay="120" className="rounded-[32px] bg-slate-950/90 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Next step</p>
                <p className="mt-3 text-lg text-slate-200">{hasDocuments ? 'Ask a question about your indexed files.' : 'Upload a document to get started.'}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] xl:gap-10">
          <aside className="space-y-6" data-aos="fade-right">
            <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Upload & manage</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Upload a document, index it, and keep track of active files in your workspace.</p>
                </div>
                <div className="rounded-full bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200 ring-1 ring-cyan-400/20">Fast upload</div>
              </div>

              <UploadBox onUploadSuccess={handleUploadSuccess} />
            </div>

            <Sidebar documents={documents} onDocumentDelete={handleDocumentDelete} />
          </aside>

          <main className="space-y-6" data-aos="fade-left">
            <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Claude AI chat console</h2>
                  <p className="mt-1 text-sm text-slate-400">Ask questions and review answers that are grounded in the documents you uploaded.</p>
                </div>
                <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300 ring-1 ring-slate-700">
                  <span className={loading ? 'inline-flex h-3 w-3 animate-pulse rounded-full bg-cyan-400' : 'inline-flex h-3 w-3 rounded-full bg-slate-700'} />
                  {loading ? 'Processing…' : 'Ready to answer'}
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-slate-800/80 bg-slate-900/90 p-5 shadow-inner shadow-slate-950/10">
                <div className="max-h-[540px] space-y-4 overflow-y-auto pr-1 sm:max-h-[520px]">
                  {messages.map((message) => (
                    <Message key={message.id} message={message} />
                  ))}
                </div>

                <div className="mt-6 rounded-[28px] border border-slate-800/80 bg-slate-950/95 p-5 shadow-sm shadow-slate-950/10">
                  <label htmlFor="chat-question" className="block text-sm font-medium text-slate-300">Ask a question</label>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <textarea
                      id="chat-question"
                      rows={4}
                      value={question}
                      onChange={(event) => setQuestion(event.target.value)}
                      placeholder={hasDocuments ? 'Ask about the uploaded documents...' : 'Upload a document to get started.'}
                      className="min-h-[140px] w-full rounded-[24px] border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <button
                      type="button"
                      onClick={sendQuestion}
                      disabled={!canSubmit}
                      className="btn-hover-lift inline-flex min-h-[140px] w-full items-center justify-center rounded-[24px] bg-cyan-500 px-6 text-sm font-semibold text-slate-950 transition-smooth disabled:cursor-not-allowed disabled:bg-cyan-500/50 sm:w-auto"
                    >
                      {loading ? 'Waiting...' : 'Send question'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {recentCitations.length > 0 && (
              <div data-aos="fade-up" className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Source citations</h2>
                    <p className="mt-1 text-sm text-slate-400">Verified snippets from the documents used to answer your question.</p>
                  </div>
                  <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">Grounded answers</span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {recentCitations.map((citation) => (
                    <Citation key={citation.id} citation={citation} />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
