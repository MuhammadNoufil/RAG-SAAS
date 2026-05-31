'use client';

import { useState } from 'react';

interface UploadBoxProps {
  onUploadSuccess: (fileName: string) => void;
}

export default function UploadBox({ onUploadSuccess }: UploadBoxProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('Choose a file and upload it to index your content.');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setMessage('Indexing your document...');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadSuccess(data.fileName || file.name);
      setMessage(`Uploaded ${file.name}. ${data.documentCount} chunks indexed.`);
    } catch (error) {
      setMessage(`Upload error: ${(error as Error).message}`);
    } finally {
      setUploading(false);
      if (input) {
        input.value = '';
      }
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <label className="inline-flex w-full cursor-pointer items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/90 px-4 py-4 text-left shadow-sm shadow-slate-950/10 transition hover:border-cyan-400/40">
        <div>
          <p className="text-sm font-semibold text-slate-100">Upload document</p>
          <p className="mt-1 text-xs text-slate-400">PDF, DOCX, TXT, HTML</p>
        </div>
        <span className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-950">Browse</span>
        <input type="file" accept=".pdf,.docx,.doc,.txt,.html" onChange={handleFileChange} className="hidden" disabled={uploading} />
      </label>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
