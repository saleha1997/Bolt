import React, { useState, useEffect, useRef } from 'react';
import {
  BoltMode,
  ReasoningLevel,
  ChatSession,
  ChatMessage,
  ProjectItem,
  AppSettings,
  getDefaultSettings,
  detectOptimalMode,
  matchWakeWord,
  togglePinSession,
  removeSession,
} from './utils/boltEngine';
import { Header } from './components/Header';
import { SidebarDrawer } from './components/SidebarDrawer';
import { ModeSelectorModal } from './components/ModeSelectorModal';
import { ChatArea } from './components/ChatArea';
import { InputBar } from './components/InputBar';
import { VoiceModal } from './components/VoiceModal';
import { SettingsModal } from './components/SettingsModal';
import { NativeAppModal } from './components/NativeAppModal';

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: 'sample-1',
    title: 'Hi, kemon aso tumi?',
    pinned: true,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    messages: [
      {
        id: 'm1',
        sender: 'user',
        text: 'Hi, kemon aso tumi?',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 'm2',
        sender: 'bolt',
        text: 'হ্যালো! আমি বোল্ট (Bolt), আপনার পার্সোনাল ইউনিভার্সাল এআই অ্যাসিস্ট্যান্ট। আমি খুব ভালো আছি। আপনি বাংলা বা ইংরেজিতে যেকোনো প্রশ্ন করতে পারেন, কোড বানাতে পারেন, বা ৩ডি অ্যাপ বিল্ড করতে পারেন। আমি কীভাবে সাহায্য করতে পারি?',
        timestamp: Date.now() - 3590000,
        mode: 'auto',
      },
    ],
  },
  {
    id: 'sample-2',
    title: 'Ei app voice mode kaj ...',
    pinned: false,
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
    messages: [
      {
        id: 'm3',
        sender: 'user',
        text: 'Ei app voice mode kaj ki?',
        timestamp: Date.now() - 7200000,
      },
      {
        id: 'm4',
        sender: 'bolt',
        text: 'বোল্ট ভয়েস মোডে আপনি সরাসরি মুখে বাংলা বা ইংরেজিতে কথা বলে যেকোনো কাজ করতে পারবেন। এমনকি ওয়েক ওয়ার্ড "Bolt" বললে নিজে থেকেই অ্যাক্টিভ হয়ে যাবে এবং ভয়েসেই আপনাকে উত্তর ফিরিয়ে দেবে।',
        timestamp: Date.now() - 7190000,
        mode: 'auto',
      },
    ],
  },
];

export default function App() {
  // Load settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('bolt_settings_v1');
      return saved ? JSON.parse(saved) : getDefaultSettings();
    } catch {
      return getDefaultSettings();
    }
  });

  // Load chat sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('bolt_sessions_v1');
      return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
    } catch {
      return INITIAL_SESSIONS;
    }
  });

  // Load projects
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem('bolt_projects_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return sessions.length > 0 ? sessions[0].id : null;
  });

  const [currentMode, setCurrentMode] = useState<BoltMode>('build');
  const [reasoning, setReasoning] = useState<ReasoningLevel>('fast');
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNativeModalOpen, setIsNativeModalOpen] = useState(false);

  // Sync settings and sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bolt_settings_v1', JSON.stringify(settings));
      document.documentElement.setAttribute('data-theme', settings.theme);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('bolt_sessions_v1', JSON.stringify(sessions));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('bolt_projects_v1', JSON.stringify(projects));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [projects]);

  // Active Session
  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  // Speech Synthesis helper for reading aloud
  const speakTextAloud = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Here is the code block.')
      .replace(/[*#_~]/g, '')
      .slice(0, 450);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const isBengali = /[\u0980-\u09FF]/.test(cleanText) || settings.voiceLanguage === 'bengali';

    const voices = window.speechSynthesis.getVoices();
    if (isBengali) {
      const bnVoice = voices.find((v) => v.lang.startsWith('bn'));
      if (bnVoice) utterance.voice = bnVoice;
      utterance.lang = 'bn-BD';
    } else {
      const enVoice = voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = 'en-US';
    }

    window.speechSynthesis.speak(utterance);
  };

  // Handle Send Message
  const handleSendMessage = async (text: string, attachment?: { name: string; type: string }) => {
    if (!text.trim() && !attachment) return;

    // Detect actual mode to use (if auto mode is active, automatically route to best agent)
    let effectiveMode = currentMode;
    if (currentMode === 'auto') {
      effectiveMode = detectOptimalMode(text);
    }

    // Prepare user message
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: attachment ? `${text}\n[Attached File: ${attachment.name}]` : text,
      timestamp: Date.now(),
      mode: effectiveMode,
    };

    let targetSessionId = activeSessionId;
    let updatedSessions = [...sessions];

    // If no active session or active session has messages and user clicks new
    if (!targetSessionId || !sessions.some((s) => s.id === targetSessionId)) {
      const newSession: ChatSession = {
        id: `sess-${Date.now()}`,
        title: text.slice(0, 28) || 'New chat',
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMsg],
      };
      targetSessionId = newSession.id;
      updatedSessions = [newSession, ...updatedSessions];
      setSessions(updatedSessions);
      setActiveSessionId(targetSessionId);
    } else {
      updatedSessions = updatedSessions.map((sess) => {
        if (sess.id === targetSessionId) {
          const isFirst = sess.messages.length === 0;
          return {
            ...sess,
            title: isFirst ? text.slice(0, 28) : sess.title,
            updatedAt: Date.now(),
            messages: [...sess.messages, userMsg],
          };
        }
        return sess;
      });
      setSessions(updatedSessions);
    }

    setIsLoading(true);

    try {
      // Find custom provider for the effective slot if configured
      const matchingSlot = settings.aiSlots.find((s) => s.modeKey === effectiveMode);
      const customProvider = matchingSlot?.apiKey ? matchingSlot : undefined;

      const historyToSend = (activeSession?.messages || []).slice(-4).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: historyToSend,
          mode: effectiveMode,
          reasoning,
          language: settings.voiceLanguage,
          customProvider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server returned an error');
      }

      const boltReply: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bolt',
        text: data.text || 'I have completed your request.',
        timestamp: Date.now(),
        mode: effectiveMode,
        reasoning,
      };

      setSessions((prev) =>
        prev.map((sess) => {
          if (sess.id === targetSessionId) {
            return {
              ...sess,
              updatedAt: Date.now(),
              messages: [...sess.messages, boltReply],
            };
          }
          return sess;
        })
      );
    } catch (error: any) {
      const errorReply: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bolt',
        text: `Error: ${error?.message || 'Could not reach Bolt server'}. Please check your connection or Settings.`,
        timestamp: Date.now(),
        mode: effectiveMode,
      };

      setSessions((prev) =>
        prev.map((sess) => {
          if (sess.id === targetSessionId) {
            return {
              ...sess,
              updatedAt: Date.now(),
              messages: [...sess.messages, errorReply],
            };
          }
          return sess;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Transcript handler
  const handleVoiceTranscript = async (transcript: string): Promise<string> => {
    let effectiveMode = currentMode === 'auto' ? detectOptimalMode(transcript) : currentMode;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: transcript,
          history: [],
          mode: effectiveMode,
          reasoning: 'fast',
          language: settings.voiceLanguage,
        }),
      });

      const data = await response.json();
      const reply = data.text || 'I have processed your request.';

      // Also append to current active chat session
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: transcript,
        timestamp: Date.now(),
        isVoice: true,
      };

      const boltMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bolt',
        text: reply,
        timestamp: Date.now(),
        isVoice: true,
        mode: effectiveMode,
      };

      if (activeSessionId) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, updatedAt: Date.now(), messages: [...s.messages, userMsg, boltMsg] }
              : s
          )
        );
      }

      return reply;
    } catch (err: any) {
      return `Sorry, I encountered an issue: ${err.message || 'Network error'}`;
    }
  };

  // New Chat
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `sess-${Date.now()}`,
      title: 'New chat',
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  // Pin Toggle
  const handleTogglePin = (id: string) => {
    setSessions((prev) => togglePinSession(prev, id));
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => removeSession(prev, id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Create Project
  const handleCreateProject = (name: string) => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name,
      createdAt: Date.now(),
    };
    setProjects([newProj, ...projects]);
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans text-neutral-900 dark:text-neutral-100 transition-colors duration-300"
      style={{
        background: 'var(--theme-bg-gradient)',
      }}
    >
      {/* Top Header - Clean without cluttered icons */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentMode={currentMode}
        reasoning={reasoning}
        onOpenModeSelector={() => setIsModeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full relative">
        <ChatArea
          messages={messages}
          currentMode={currentMode}
          onSelectPrompt={(prompt, mode) => {
            if (mode) setCurrentMode(mode);
            handleSendMessage(prompt);
          }}
          isLoading={isLoading}
          onSpeakText={speakTextAloud}
        />

        {/* Floating Input Bar */}
        <InputBar
          onSendMessage={handleSendMessage}
          currentMode={currentMode}
          onOpenModeSelector={() => setIsModeModalOpen(true)}
          onOpenVoice={() => setIsVoiceModalOpen(true)}
          isLoading={isLoading}
        />
      </main>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onTogglePin={handleTogglePin}
        onDeleteSession={handleDeleteSession}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenNativeModal={() => setIsNativeModalOpen(true)}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        projects={projects}
        onCreateProject={handleCreateProject}
        sidebarLayout={settings.sidebarLayout}
      />

      {/* Mode Selector Modal */}
      <ModeSelectorModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        selectedMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        reasoning={reasoning}
        onChangeReasoning={(level) => setReasoning(level)}
      />

      {/* Voice Mode Modal with Radiant Metallic Green Orb */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onVoiceTranscript={handleVoiceTranscript}
        preferredLanguage={settings.voiceLanguage}
        wakeWord={settings.wakeWord}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
      />

      {/* Native App (APK & EXE) Builder Modal */}
      <NativeAppModal
        isOpen={isNativeModalOpen}
        onClose={() => setIsNativeModalOpen(false)}
      />
    </div>
  );
}
