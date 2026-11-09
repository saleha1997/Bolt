import React from 'react';
import { BoltMode, ReasoningLevel } from '../utils/boltEngine';
import { Zap, Sparkles, GraduationCap, Code2, Wrench, Monitor, BarChart3, Check } from 'lucide-react';

interface ModeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMode: BoltMode;
  onSelectMode: (mode: BoltMode) => void;
  reasoning: ReasoningLevel;
  onChangeReasoning: (level: ReasoningLevel) => void;
}

interface ModeOption {
  id: BoltMode;
  title: string;
  desc: string;
  icon: string;
  lucideIcon: React.ReactNode;
}

const MODES: ModeOption[] = [
  {
    id: 'fast',
    title: 'Fast',
    desc: 'Quick, direct answers',
    icon: '⚡',
    lucideIcon: <Zap className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 'auto',
    title: 'Auto',
    desc: 'Combines every skill and picks for you',
    icon: '✨',
    lucideIcon: <Sparkles className="w-5 h-5 text-amber-400" />,
  },
  {
    id: 'education',
    title: 'Education',
    desc: 'Guides, practice Q&A and visual answers',
    icon: '🎓',
    lucideIcon: <GraduationCap className="w-5 h-5 text-indigo-500" />,
  },
  {
    id: 'coding',
    title: 'Coding',
    desc: 'Complete, runnable code',
    icon: '💻',
    lucideIcon: <Code2 className="w-5 h-5 text-cyan-600" />,
  },
  {
    id: 'build',
    title: 'Build',
    desc: 'Apps, games, 3D and music you can preview',
    icon: '🛠️',
    lucideIcon: <Wrench className="w-5 h-5 text-sky-500" />,
  },
  {
    id: 'device',
    title: 'Device control',
    desc: 'Commands for your phone or computer',
    icon: '🖥️',
    lucideIcon: <Monitor className="w-5 h-5 text-emerald-600" />,
  },
  {
    id: 'pro',
    title: 'Pro work',
    desc: 'Reports, tables and calculations',
    icon: '📊',
    lucideIcon: <BarChart3 className="w-5 h-5 text-emerald-500" />,
  },
];

const REASONING_LEVELS: ReasoningLevel[] = ['instant', 'fast', 'thinking', 'pro', 'max'];

export const ModeSelectorModal: React.FC<ModeSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedMode,
  onSelectMode,
  reasoning,
  onChangeReasoning,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-label="Close mode selector backdrop"
      />

      {/* Modal Card matching screenshot Screenshot_2026-11-07-15-37-33-113 */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#151c20] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 p-5 overflow-hidden animate-slideUp">
        {/* Modes List */}
        <div className="space-y-1 mb-5">
          {MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  onSelectMode(mode.id);
                  onClose();
                }}
                className={`w-full flex items-start gap-3.5 p-3 rounded-2xl text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 shadow-sm'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60 border border-transparent'
                }`}
              >
                <div className="text-xl flex-shrink-0 mt-0.5">{mode.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-base font-bold ${
                        isSelected
                          ? 'text-emerald-900 dark:text-emerald-200'
                          : 'text-neutral-900 dark:text-white'
                      }`}
                    >
                      {mode.title}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                    {mode.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Reasoning Level Row matching screenshot */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block mb-2.5">
            Reasoning
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {REASONING_LEVELS.map((level) => {
              const isCurrent = reasoning === level;
              return (
                <button
                  key={level}
                  onClick={() => onChangeReasoning(level)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
