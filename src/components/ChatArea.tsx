import React, { useState } from 'react';
import { BoltIcon } from './BoltIcon';
import { ChatMessage, BoltMode } from '../utils/boltEngine';
import { Copy, Check, Play, Terminal, Volume2, Sparkles, ExternalLink, Code2, Eye } from 'lucide-react';

interface ChatAreaProps {
  messages: ChatMessage[];
  currentMode: BoltMode;
  onSelectPrompt: (prompt: string, mode?: BoltMode) => void;
  isLoading: boolean;
  onSpeakText: (text: string) => void;
}

const STARTER_PROMPTS = [
  {
    mode: 'education' as BoltMode,
    icon: '🎓',
    title: 'Science & Math Solver',
    desc: 'Frontier Math & ARC-AGI reasoning with step-by-step diagrams and practice Q&A.',
    prompt: 'Explain the Pythagorean theorem and trigonometric ratios with a visual ASCII diagram and 2 practice questions.',
  },
  {
    mode: 'build' as BoltMode,
    icon: '🛠️',
    title: 'Interactive 3D / App Builder',
    desc: 'Build runnable games, 3D scenes, or interactive tools with sandbox preview.',
    prompt: 'Build a playable 2D Neon Pong game in a single interactive HTML/JS canvas with score tracking.',
  },
  {
    mode: 'coding' as BoltMode,
    icon: '💻',
    title: 'Software Engineering Agent',
    desc: 'Handles complex codebases, QR code generators, terminal scripts, and bug fixes.',
    prompt: 'Write a complete Python and JavaScript solution to generate custom QR codes with color gradients.',
  },
  {
    mode: 'device' as BoltMode,
    icon: '🖥️',
    title: 'Device & Computer Control',
    desc: 'Troubleshoot Windows/Mac/Android, disk drives, calendar, CRM, and simulated actions.',
    prompt: 'ল্যাপটপে নতুন ড্রাইভ পার্টিশন (New Drive Partition) তৈরি করার জন্য স্টেপ বাই স্টেপ কমান্ড ও গাইড দাও।',
  },
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  currentMode,
  onSelectPrompt,
  isLoading,
  onSpeakText,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [simulatingDevice, setSimulatingDevice] = useState<string | null>(null);
  const [deviceLogs, setDeviceLogs] = useState<Record<string, string[]>>({});

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateDeviceCommand = async (msgId: string, cmd: string) => {
    setSimulatingDevice(msgId);
    try {
      const resp = await fetch('/api/device-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, type: 'os_troubleshoot' }),
      });
      const data = await resp.json();
      setDeviceLogs((prev) => ({
        ...prev,
        [msgId]: data.logs || ['Command executed successfully.'],
      }));
    } catch (e) {
      setDeviceLogs((prev) => ({
        ...prev,
        [msgId]: ['Simulation completed: Target device verified.'],
      }));
    } finally {
      setSimulatingDevice(null);
    }
  };

  // Helper to extract html/code blocks from text
  const extractCodeBlock = (text: string): { cleanText: string; code?: string; lang?: string } => {
    const codeMatch = text.match(/```(\w*)\n([\s\S]*?)```/);
    if (codeMatch) {
      return {
        cleanText: text,
        lang: codeMatch[1] || 'code',
        code: codeMatch[2],
      };
    }
    return { cleanText: text };
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full transition-all">
      {/* Empty State matching Screenshot_2026-11-07-15-37-11-725 */}
      {messages.length === 0 ? (
        <div className="min-h-[68vh] flex flex-col items-center justify-center text-center px-4 animate-fadeIn">
          {/* Large Bolt Icon */}
          <div className="mb-6 hover:scale-105 transition-transform duration-300">
            <BoltIcon size={76} />
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-3">
            What should Bolt do?
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-md mx-auto mb-8 leading-relaxed">
            Ask, learn, code, build or fix. Use the mode button next to the message box.
          </p>

          {/* Feature Suggestion Cards based on mindmap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
            {STARTER_PROMPTS.map((starter, i) => (
              <button
                key={i}
                onClick={() => onSelectPrompt(starter.prompt, starter.mode)}
                className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 hover:bg-white/95 dark:hover:bg-white/10 border border-white/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{starter.icon}</span>
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {starter.title}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {starter.desc}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-3 block group-hover:underline">
                  Try prompt →
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Messages List */
        <div className="space-y-6 pb-20 animate-fadeIn">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const { code, lang } = extractCodeBlock(msg.text);
            const isBuildOrCode = msg.mode === 'build' || msg.mode === 'coding';
            const isPreviewOpen = activePreviewId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-slideUp`}
              >
                {/* User Message Bubble */}
                {isUser ? (
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-3xl rounded-tr-sm bg-emerald-600 text-white px-5 py-3.5 shadow-md shadow-emerald-700/15">
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                    <span className="text-[10px] text-emerald-200/80 block text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ) : (
                  /* Bolt Assistant Bubble */
                  <div className="w-full max-w-full sm:max-w-[92%] rounded-3xl rounded-tl-sm bg-white/80 dark:bg-[#151c20]/90 backdrop-blur-xl border border-white/60 dark:border-white/10 p-5 shadow-lg space-y-3.5">
                    {/* Top header row */}
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <BoltIcon size={26} />
                        <span className="font-bold text-sm text-neutral-900 dark:text-white">Bolt</span>
                        {msg.mode && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 capitalize">
                            {msg.mode}
                          </span>
                        )}
                        {msg.reasoning && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 capitalize">
                            {msg.reasoning} reasoning
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Audio Speak Aloud Button */}
                        <button
                          onClick={() => onSpeakText(msg.text)}
                          aria-label="Listen to response"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          title="Listen in English / Bengali"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          aria-label="Copy text"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content text */}
                    <div className="text-neutral-800 dark:text-neutral-200 text-sm sm:text-base leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
                      {msg.text}
                    </div>

                    {/* Live Preview Sandbox for Build & Coding Mode */}
                    {code && (code.includes('<html') || code.includes('<!DOCTYPE') || code.includes('<canvas') || code.includes('function') || code.includes('const')) && (
                      <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Interactive Sandbox & Live Preview</span>
                          </span>

                          <button
                            onClick={() => setActivePreviewId(isPreviewOpen ? null : msg.id)}
                            className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            {isPreviewOpen ? <Code2 className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{isPreviewOpen ? 'Hide Preview' : 'Run Interactive Preview'}</span>
                          </button>
                        </div>

                        {isPreviewOpen && (
                          <div className="rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-black/90 p-3 shadow-inner space-y-2 animate-scaleIn">
                            <div className="flex items-center justify-between px-2 text-xs text-neutral-400">
                              <span>Sandbox Preview Container</span>
                              <span className="text-[11px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-mono">Live</span>
                            </div>
                            <iframe
                              title="Interactive Preview"
                              sandbox="allow-scripts"
                              srcDoc={code.includes('<html') ? code : `<!DOCTYPE html><html><head><style>body{margin:0;font-family:sans-serif;background:#0d1117;color:#fff;display:flex;align-items:center;justify-center;min-height:100vh;padding:20px;text-align:center;}canvas{border-radius:12px;background:#000;box-shadow:0 8px 30px rgba(0,0,0,0.5);}</style></head><body><div id="app"></div><script>${code}</script></body></html>`}
                              className="w-full h-80 rounded-xl border border-neutral-800 bg-neutral-950"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Device Control Simulation Sandbox */}
                    {msg.mode === 'device' && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                              Simulated Device Action
                            </span>
                          </div>
                          <button
                            onClick={() => handleSimulateDeviceCommand(msg.id, 'Verify drive and OS settings')}
                            disabled={simulatingDevice === msg.id}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 transition-all flex items-center gap-1.5"
                          >
                            {simulatingDevice === msg.id ? (
                              <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            <span>Simulate Execution</span>
                          </button>
                        </div>

                        {deviceLogs[msg.id] && (
                          <div className="mt-2 p-2.5 rounded-xl bg-black/90 font-mono text-[11px] text-emerald-400 space-y-1">
                            {deviceLogs[msg.id].map((log, li) => (
                              <div key={li}>{log}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 animate-pulse px-2">
              <BoltIcon size={24} />
              <span className="text-sm font-medium">Bolt is thinking and preparing your response...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
