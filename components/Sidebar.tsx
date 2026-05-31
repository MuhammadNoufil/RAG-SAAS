interface SidebarProps {
  documents: string[];
}

export default function Sidebar({ documents }: SidebarProps) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
      <h2 className="text-xl font-semibold text-white">Workspace summary</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        This sidebar shows the documents currently indexed for retrieval. Use the chat panel to ask questions grounded in this content.
      </p>

      <div className="mt-5 space-y-3">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 px-4 py-4 text-sm text-slate-200">
              {doc}
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-sm text-slate-500">No documents indexed yet. Upload a file to start.</div>
        )}
      </div>

      <div className="mt-8 space-y-3 rounded-3xl border border-slate-800/90 bg-slate-900/80 p-4 text-sm text-slate-300">
        <p className="font-semibold text-slate-100">Quick tips</p>
        <ul className="mt-3 space-y-2 list-disc pl-5 text-slate-400">
          <li>Upload concise documents for faster indexing.</li>
          <li>Ask specific questions to get more accurate answers.</li>
          <li>Reference the citations to verify the source text.</li>
        </ul>
      </div>
    </div>
  );
}
