import React from 'react';
import { BoltIcon } from './BoltIcon';
import { BoltMode, ReasoningLevel } from '../utils/boltEngine';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentMode: BoltMode;
  reasoning: ReasoningLevel;
  onOpenModeSelector: () => void;
}

const MODE_LABELS: Record<BoltMode, { label: string; icon: string }> = {
  auto: { label: 'Auto', icon: '✨' },
  fast: { label: 'Fast', icon: '⚡' },
  education: { label: 'Education', icon: '🎓' },
  coding: { label: 'Coding', icon: '💻' },
  build: { label: 'Build', icon: '🛠️' },
  device: { label: 'Device control', icon: '🖥️' },
  pro: { label: 'Pro work', icon: '📊' },
};

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentMode,
  reasoning,
  onOpenModeSelector,
}) => {
  const current = MODE_LABELS[currentMode] || MODE_LABELS.auto;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 backdrop-blur-md bg-transparent transition-all">
      <div className="flex items-center gap-3">
        {/* Clean circular menu button matching original screenshot */}
        <button
          onClick={onToggleSidebar}
          aria-label="Open sidebar menu"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/70 dark:bg-neutral-800/80 border border-white/50 dark:border-neutral-700 shadow-sm hover:scale-105 active:scale-95 transition-all text-neutral-700 dark:text-neutral-200"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mode badge pill clickable to open modes */}
        <button
          onClick={onOpenModeSelector}
          aria-label="Select mode"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-black/30 border border-black/5 dark:border-white/10 shadow-sm hover:bg-white/80 dark:hover:bg-black/50 transition-all cursor-pointer"
        >
          <span className="text-sm">{current.icon}</span>
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{current.label}</span>
        </button>
      </div>

      {/* Top right has no cluttered buttons as requested by the user */}
      <div className="w-11 h-11 opacity-0 pointer-events-none" />
    </header>
  );
};
