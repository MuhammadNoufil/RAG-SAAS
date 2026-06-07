import type { SearchResult } from '@/types/chat';

interface CitationProps {
  citation: SearchResult;
}

export default function Citation({ citation }: CitationProps) {
  return (
    <div data-aos="fade-up" className="animate-slide-in-up rounded-[28px] border border-slate-800/90 bg-slate-900/90 p-6 shadow-sm shadow-slate-950/10 transition-smooth hover:border-slate-700/70 hover:shadow-md hover:shadow-cyan-500/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white transition-smooth hover:text-cyan-300">Source: {citation.source}</p>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-400 transition-smooth hover:bg-slate-700">Score {citation.score.toFixed(2)}</span>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">{citation.text}</p>
    </div>
  );
}
