import type { ChatMessage } from '@/types/chat';

interface MessageProps {
  message: ChatMessage;
}

export default function Message({ message }: MessageProps) {
  const isAssistant = message.role === 'assistant';
  return (
    <div data-aos="fade-up" className={`rounded-[28px] border p-5 shadow-xl shadow-slate-950/10 ${isAssistant ? 'border-slate-800 bg-slate-900/95' : 'border-slate-800/90 bg-slate-950/90'}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-3xl text-xs font-semibold uppercase tracking-[0.24em] ${isAssistant ? 'bg-cyan-500/20 text-cyan-200' : 'bg-slate-700 text-slate-200'}`}>
          {isAssistant ? 'AI' : 'You'}
        </div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{isAssistant ? 'Assistant' : 'User'}</p>
      </div>
      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">{message.text}</p>
    </div>
  );
}
