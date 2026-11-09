import React, { useState } from 'react';
import { AppSettings, ThemeType, VoiceLanguage, AIProviderSlot } from '../utils/boltEngine';
import { X, ChevronDown, ChevronUp, Key, Cpu, Sparkles, Check, Palette } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeSlotAccordion, setActiveSlotAccordion] = useState<number | null>(null);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  if (!isOpen) return null;

  const handleThemeChange = (theme: ThemeType) => {
    const updated = { ...localSettings, theme };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleLayoutChange = (sidebarLayout: 'left' | 'right') => {
    const updated = { ...localSettings, sidebarLayout };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleVoiceLanguageChange = (voiceLanguage: VoiceLanguage) => {
    const updated = { ...localSettings, voiceLanguage };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleSlotChange = (slotId: number, field: keyof AIProviderSlot, value: any) => {
    const updatedSlots = localSettings.aiSlots.map((slot) => {
      if (slot.id === slotId) {
        return {
          ...slot,
          [field]: value,
          configured: field === 'apiKey' ? Boolean(value && value.trim()) : slot.configured,
        };
      }
      return slot;
    });

    const updated = { ...localSettings, aiSlots: updatedSlots };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-label="Close settings backdrop"
      />

      {/* Modal Card matching Screenshot_2026-11-07-15-38-16-152 */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] bg-white dark:bg-[#141b1f] rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 flex flex-col overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/20">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings modal"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Theme Section */}
          <div>
            <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block mb-2.5">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Lavender */}
              <button
                type="button"
                onClick={() => handleThemeChange('lavender')}
                className={`py-3 px-2 rounded-2xl text-sm font-semibold transition-all border ${
                  localSettings.theme === 'lavender'
                    ? 'bg-[#c4b5fd]/40 text-[#4c1d95] border-[#8b5cf6] ring-2 ring-[#8b5cf6]/30'
                    : 'bg-[#ede9fe]/40 text-neutral-700 dark:text-neutral-300 border-transparent hover:bg-[#ede9fe]/70'
                }`}
              >
                Lavender
              </button>

              {/* Midnight */}
              <button
                type="button"
                onClick={() => handleThemeChange('midnight')}
                className={`py-3 px-2 rounded-2xl text-sm font-semibold transition-all border ${
                  localSettings.theme === 'midnight'
                    ? 'bg-[#0f172a] text-white border-emerald-500 ring-2 ring-emerald-500/30'
                    : 'bg-[#1e293b]/70 text-neutral-300 border-transparent hover:bg-[#1e293b]'
                }`}
              >
                Midnight
              </button>

              {/* Mint */}
              <button
                type="button"
                onClick={() => handleThemeChange('mint')}
                className={`py-3 px-2 rounded-2xl text-sm font-semibold transition-all border ${
                  localSettings.theme === 'mint'
                    ? 'bg-[#a7f3d0] text-[#064e3b] border-[#10b981] ring-2 ring-[#10b981]/30'
                    : 'bg-[#ccfbf1]/50 text-neutral-700 dark:text-neutral-300 border-transparent hover:bg-[#ccfbf1]/80'
                }`}
              >
                Mint
              </button>
            </div>
          </div>

          {/* Layout Section */}
          <div>
            <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block mb-2">
              Layout
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Sidebar</span>
              <select
                value={localSettings.sidebarLayout}
                onChange={(e) => handleLayoutChange(e.target.value as 'left' | 'right')}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          {/* Voice Language Section */}
          <div>
            <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block mb-2">
              Voice
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Language</span>
              <select
                value={localSettings.voiceLanguage}
                onChange={(e) => handleVoiceLanguageChange(e.target.value as VoiceLanguage)}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="english">English</option>
                <option value="bengali">Bengali (বাংলা)</option>
                <option value="auto">Auto-detect</option>
              </select>
            </div>
          </div>

          {/* Speech-to-text (Windows app) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block">
              Speech-to-text (Windows app)
            </label>
            <input
              type="password"
              placeholder="API Key (optional)"
              value={localSettings.speechToTextKey}
              onChange={(e) => {
                const updated = { ...localSettings, speechToTextKey: e.target.value };
                setLocalSettings(updated);
                onUpdateSettings(updated);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              value={localSettings.speechToTextUrl}
              onChange={(e) => {
                const updated = { ...localSettings, speechToTextUrl: e.target.value };
                setLocalSettings(updated);
                onUpdateSettings(updated);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="text"
              value={localSettings.speechToTextModel}
              onChange={(e) => {
                const updated = { ...localSettings, speechToTextModel: e.target.value };
                setLocalSettings(updated);
                onUpdateSettings(updated);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              The Windows app hears you through this (a free Groq key works). The Android app uses the phone's own speech recognition and needs no key.
            </p>
          </div>

          {/* Wake text Section */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200 block">
              Wake text
            </label>
            <input
              type="text"
              value={localSettings.wakeWord}
              onChange={(e) => {
                const updated = { ...localSettings, wakeWord: e.target.value };
                setLocalSettings(updated);
                onUpdateSettings(updated);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Say it with the phone locked to start voice commands; say it plus 'off' to stop. Saved for later: waking Bolt from a locked phone needs a background service that isn't built yet.
            </p>
          </div>

          {/* AI Providers (6 slots) */}
          <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                AI providers (6 slots)
              </label>
            </div>

            <div className="space-y-2">
              {localSettings.aiSlots.map((slot) => {
                const isExpanded = activeSlotAccordion === slot.id;
                return (
                  <div
                    key={slot.id}
                    className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveSlotAccordion(isExpanded ? null : slot.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                        {slot.id}. {slot.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">
                          {slot.apiKey ? 'configured' : 'empty'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-neutral-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-1 space-y-3 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 animate-slideDown">
                        <div>
                          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                            AI provider
                          </label>
                          <select
                            value={slot.provider}
                            onChange={(e) => handleSlotChange(slot.id, 'provider', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium"
                          >
                            <option value="gemini">Google Gemini (Default)</option>
                            <option value="openrouter">OpenRouter</option>
                            <option value="openai">OpenAI-compatible</option>
                            <option value="claude">Anthropic Claude</option>
                            <option value="custom">Custom Endpoint</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                            API key
                          </label>
                          <input
                            type="password"
                            placeholder="sk-..."
                            value={slot.apiKey}
                            onChange={(e) => handleSlotChange(slot.id, 'apiKey', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                            Model (for Max level, list several separated by commas)
                          </label>
                          <input
                            type="text"
                            placeholder="gemini-3.8-flash"
                            value={slot.model}
                            onChange={(e) => handleSlotChange(slot.id, 'model', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
                            Base URL (OpenAI-compatible only)
                          </label>
                          <input
                            type="text"
                            placeholder="https://openrouter.ai/api/v1"
                            value={slot.baseUrl}
                            onChange={(e) => handleSlotChange(slot.id, 'baseUrl', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed pt-2">
              Auto mode sends each task to the slot that fits it, and falls back to any ready slot. Keys stay on this device. Provider calls work in the downloaded Bolt file and the Bolt apps, not on the hosted preview page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
