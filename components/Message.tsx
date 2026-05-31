import type { ChatMessage } from '@/types/chat';

interface MessageProps {
  message: ChatMessage;
}

export default function Message({ message }: MessageProps) {
  const isAssistant = message.role === 'assistant';
  return (
    <div className={`rounded-[28px] border ${isAssistant ? 'border-slate-800 bg-slate-900/95' : 'border-slate-800/90 bg-slate-950/80'} p-5 shadow-lg shadow-slate-950/10`}>
      <div className="mb-3 flex items-center gap-3">
        <div className={`h-9 w-9 rounded-full ${isAssistant ? 'bg-cyan-500/20 text-cyan-200' : 'bg-slate-700 text-slate-200'} grid place-items-center text-xs font-semibold uppercase tracking-[0.25em]`}>
          {isAssistant ? 'AI' : 'You'}
        </div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{isAssistant ? 'Assistant' : 'User'}</p>
      </div>
      <p className="whitespace-pre-line break-words text-sm leading-7 text-slate-200">{message.text}</p>
    </div>
  );
}
