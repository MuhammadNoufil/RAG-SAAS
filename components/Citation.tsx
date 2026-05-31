import type { SearchResult } from '@/types/chat';

interface CitationProps {
  citation: SearchResult;
}

export default function Citation({ citation }: CitationProps) {
  return (
    <div data-aos="fade-up" className="rounded-[28px] border border-slate-800/90 bg-slate-900/90 p-6 shadow-sm shadow-slate-950/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">Source: {citation.source}</p>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-400">Score {citation.score.toFixed(2)}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{citation.text}</p>
    </div>
  );
}
