import React, { useRef, useState } from 'react';
import { BoltMode } from '../utils/boltEngine';
import { Paperclip, Mic, ArrowUp, ChevronDown, X, FileText } from 'lucide-react';

interface InputBarProps {
  onSendMessage: (text: string, attachment?: { name: string; type: string }) => void;
  currentMode: BoltMode;
  onOpenModeSelector: () => void;
  onOpenVoice: () => void;
  isLoading: boolean;
}

const MODE_SHORT_ICONS: Record<BoltMode, string> = {
  auto: '✨',
  fast: '⚡',
  education: '🎓',
  coding: '💻',
  build: '🛠️',
  device: '🖥️',
  pro: '📊',
};

const MODE_SHORT_NAMES: Record<BoltMode, string> = {
  auto: 'Auto',
  fast: 'Fast',
  education: 'Education',
  coding: 'Coding',
  build: 'Build',
  device: 'Device',
  pro: 'Pro work',
};

export const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  currentMode,
  onOpenModeSelector,
  onOpenVoice,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<{ name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachment) || isLoading) return;

    onSendMessage(inputText.trim(), attachment || undefined);
    setInputText('');
    setAttachment(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment({
        name: file.name,
        type: file.type || 'file',
      });
    }
  };

  const currentIcon = MODE_SHORT_ICONS[currentMode] || '✨';
  const currentName = MODE_SHORT_NAMES[currentMode] || 'Auto';

  return (
    <div className="sticky bottom-0 z-20 px-3 pb-3 pt-2 sm:px-6 sm:pb-6">
      <div className="max-w-3xl mx-auto">
        {/* Attachment preview tag if any */}
        {attachment && (
          <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 w-fit backdrop-blur-md">
            <FileText className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{attachment.name}</span>
            <button
              onClick={() => setAttachment(null)}
              aria-label="Remove attachment"
              className="text-neutral-400 hover:text-red-500 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Floating pill card matching Screenshot_2026-11-07-15-37-11-725 */}
        <div className="relative rounded-3xl bg-white/85 dark:bg-[#151c20]/90 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/20 p-2 sm:p-2.5 transition-all focus-within:ring-2 focus-within:ring-emerald-500/30">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.txt,.py,.js,.ts,.json"
          />

          {/* Text input area */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Bolt anything"
            rows={1}
            disabled={isLoading}
            className="w-full resize-none px-3 pt-1 pb-2 bg-transparent text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-base sm:text-lg focus:outline-none max-h-36 overflow-y-auto"
            style={{ minHeight: '44px' }}
          />

          {/* Bottom control row inside input card */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {/* Attachment paperclip button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Attach file"
                className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Attach file or photo"
              >
                <Paperclip className="w-4 h-4 rotate-45" />
              </button>

              {/* Mode button pill matching screenshot (e.g. 🛠️ Build ⌵) */}
              <button
                type="button"
                onClick={onOpenModeSelector}
                aria-label="Change AI mode"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-black/5 dark:border-white/5 transition-all shadow-sm"
              >
                <span>{currentIcon}</span>
                <span>{currentName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Mic button for Voice Mode */}
              <button
                type="button"
                onClick={onOpenVoice}
                aria-label="Start voice input"
                className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Voice mode"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Circular Green Send Button with Arrow Up */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={(!inputText.trim() && !attachment) || isLoading}
                aria-label="Send prompt"
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all shadow-md ${
                  (inputText.trim() || attachment) && !isLoading
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-700/30 scale-100 active:scale-95'
                    : 'bg-emerald-600/40 opacity-70 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
