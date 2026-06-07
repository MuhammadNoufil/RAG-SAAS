'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface SidebarProps {
  documents: string[];
  onDocumentDelete?: (documentId: string) => void;
}

export default function Sidebar({ documents, onDocumentDelete }: SidebarProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  const handleDeleteClick = (docId: string) => {
    setConfirmDelete(docId);
    setDeleteError(null);
    setDeleteSuccess(null);
  };

  const handleConfirmDelete = async (docId: string) => {
    setDeletingId(docId);
    setDeleteError(null);
    setDeleteSuccess(null);

    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setDeleteError(data.error || 'Failed to delete document');
        setDeletingId(null);
        return;
      }

      setDeleteSuccess(`"${docId}" deleted successfully`);
      setConfirmDelete(null);
      setDeletingId(null);

      // Notify parent component
      onDocumentDelete?.(docId);

      // Clear success message after 3 seconds
      setTimeout(() => setDeleteSuccess(null), 3000);
    } catch (error) {
      setDeleteError(`Error: ${(error as Error).message}`);
      setDeletingId(null);
    }
  };

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
                <div
                  key={doc}
                  className="animate-slide-in-up flex items-center justify-between rounded-3xl border border-slate-800/90 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 transition-smooth hover:border-slate-700/70 hover:bg-slate-950/95 hover:shadow-md hover:shadow-cyan-500/10"
                >
                  <span className="truncate transition-smooth group-hover:text-white">{doc}</span>
                  <button
                    onClick={() => handleDeleteClick(doc)}
                    disabled={deletingId === doc}
                    className="btn-hover-lift ml-2 flex-shrink-0 rounded-lg p-1 text-slate-400 transition-smooth hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete document"
                  >
                    {deletingId === doc ? (
                      <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-red-400" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-sm text-slate-500">No documents indexed yet. Upload one to start asking questions.</div>
            )}
          </div>

          {deleteError && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {deleteError}
            </div>
          )}

          {deleteSuccess && (
            <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
              ✓ {deleteSuccess}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-scale-in">
          <div className="animate-scale-in rounded-[28px] border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-slate-950/50 max-w-sm mx-4 transition-smooth">
            <h3 className="text-lg font-semibold text-white">Delete document?</h3>
            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to delete <span className="font-medium text-slate-300">&quot;{confirmDelete}&quot;</span>? This will remove all associated embeddings and cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deletingId === confirmDelete}
                className="btn-hover-lift flex-1 rounded-lg border border-slate-700 bg-slate-800 py-2 text-sm font-medium text-slate-200 transition-smooth hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(confirmDelete)}
                disabled={deletingId === confirmDelete}
                className="btn-hover-lift flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition-smooth hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId === confirmDelete ? (
                  <>
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-t-red-300" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
