interface SidebarProps {
  documents: string[];
}

export default function Sidebar({ documents }: SidebarProps) {
  return (
    <div data-aos="fade-up" className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Workspace summary</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Track the documents in your current workspace and review tips for better results.</p>
        </div>
        <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200 ring-1 ring-cyan-400/20">Live</div>
      </div>

      <div className="mt-6 grid gap-4">
        <div data-aos="fade-right" className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Indexed files</p>
          <p className="mt-2 text-2xl font-semibold text-white">{documents.length}</p>
        </div>

        <div data-aos="fade-left" className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Quick tips</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>Keep documents focused for cleaner answers.</li>
            <li>Ask direct questions for precise responses.</li>
            <li>Review sources for validation.</li>
          </ul>
        </div>

        <div data-aos="fade-up" className="rounded-[28px] border border-slate-800/90 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-400">Active documents</p>
          <div className="mt-4 space-y-3">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc} className="rounded-3xl border border-slate-800/90 bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
                  {doc}
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-sm text-slate-500">No documents indexed yet. Upload one to start asking questions.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
