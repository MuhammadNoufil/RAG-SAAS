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
      setMessage(`Uploaded ${file.name}. ${data.documentCount ?? 'Document'} indexed.`);
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
    <div data-aos="fade-up" className="mt-6 space-y-4">
      <label className="group block cursor-pointer rounded-[28px] border border-dashed border-slate-700 bg-slate-900/90 p-6 text-center transition hover:border-cyan-400/40 hover:bg-slate-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-800 text-cyan-300 shadow-inner shadow-cyan-500/10">
          <span className="text-2xl">⇪</span>
        </div>
        <div className="mt-5 space-y-3">
          <p className="text-lg font-semibold text-white">Upload or browse files</p>
          <p className="text-sm leading-6 text-slate-400">PDF, DOCX, TXT, HTML</p>
          <p className="text-sm text-slate-500">{uploading ? 'Indexing your document...' : message}</p>
        </div>
        <input
          type="file"
          accept=".pdf,.docx,.doc,.txt,.html"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </label>
      <div data-aos="fade-up" data-aos-delay="80" className="flex flex-wrap gap-3 text-sm text-slate-500">
        <span className="rounded-full bg-slate-900/80 px-3 py-1">Automatic text extraction</span>
        <span className="rounded-full bg-slate-900/80 px-3 py-1">Secure upload</span>
        <span className="rounded-full bg-slate-900/80 px-3 py-1">Instant indexing</span>
      </div>
    </div>
  );
}
