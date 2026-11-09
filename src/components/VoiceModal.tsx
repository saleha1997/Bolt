import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, MessageSquare, Trash2, Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { VoiceLanguage } from '../utils/boltEngine';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceTranscript: (transcript: string) => Promise<string>;
  preferredLanguage: VoiceLanguage;
  wakeWord: string;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onVoiceTranscript,
  preferredLanguage,
  wakeWord,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Tap the mic to talk');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [speechMuted, setSpeechMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Synthesis and Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        // Choose language based on preferred setting
        if (preferredLanguage === 'bengali') {
          recognition.lang = 'bn-BD';
        } else if (preferredLanguage === 'english') {
          recognition.lang = 'en-US';
        } else {
          recognition.lang = navigator.language.startsWith('bn') ? 'bn-BD' : 'en-US';
        }

        recognition.onstart = () => {
          setIsListening(true);
          setStatusMessage('Listening in বাংলা / English...');
        };

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setLiveTranscript(current);

          // Check for wake word stop command
          const lower = current.toLowerCase();
          const trigger = wakeWord.toLowerCase();
          if (lower.includes(`${trigger} off`) || lower.includes(`${trigger} stop`) || lower.includes(`${trigger} bondho`)) {
            stopListening();
            speakAloud('Bolt voice command deactivated.');
            return;
          }

          // If final result, handle processing
          const isFinal = event.results[event.results.length - 1].isFinal;
          if (isFinal && current.trim().length > 1) {
            handleProcessVoiceInput(current.trim());
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition status:', err.error);
          if (err.error === 'not-allowed') {
            setStatusMessage('Microphone access blocked. Please allow mic permissions.');
          } else if (err.error !== 'no-speech') {
            setStatusMessage('Could not catch that. Please tap and speak again.');
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      stopListening();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [preferredLanguage, wakeWord]);

  const speakAloud = (text: string) => {
    if (speechMuted || !synthRef.current) return;
    synthRef.current.cancel();

    // Clean markdown code blocks for audio speech
    const cleanSpeech = text
      .replace(/```[\s\S]*?```/g, 'Here is the generated code and preview.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~]/g, '')
      .slice(0, 450);

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);

    // Pick matching voice (Bengali or English)
    const voices = synthRef.current.getVoices();
    const isBengali = /[\u0980-\u09FF]/.test(cleanSpeech) || preferredLanguage === 'bengali';

    if (isBengali) {
      const bnVoice = voices.find((v) => v.lang.startsWith('bn'));
      if (bnVoice) utterance.voice = bnVoice;
      utterance.lang = 'bn-BD';
    } else {
      const enVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = 'en-US';
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const handleProcessVoiceInput = async (spokenText: string) => {
    setStatusMessage('Bolt is thinking...');
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    try {
      const response = await onVoiceTranscript(spokenText);
      setLastResponse(response);
      setStatusMessage('Bolt is speaking...');
      speakAloud(response);
    } catch (err: any) {
      setStatusMessage('Error processing voice query.');
    }
  };

  const startListening = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    if (recognitionRef.current) {
      try {
        setLiveTranscript('');
        recognitionRef.current.start();
      } catch (e) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.start();
        } catch (err) {
          console.warn('Could not start recognition:', err);
        }
      }
    } else {
      setStatusMessage('Speech recognition not supported in this browser. You can type in chat mode.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
      setStatusMessage('Tap the mic to talk');
    } else {
      startListening();
    }
  };

  const handleClear = () => {
    setLiveTranscript('');
    setLastResponse('');
    setStatusMessage('Tap the mic to talk');
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-[#e7edf5] via-[#e5ebf8] to-[#edf0f9] dark:from-[#0a1215] dark:via-[#0c181c] dark:to-[#070b0d] p-6 animate-fadeIn select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            stopListening();
            if (synthRef.current) synthRef.current.cancel();
            onClose();
          }}
          aria-label="Back to chat"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/80 dark:bg-white/10 text-neutral-700 dark:text-neutral-200 shadow-sm hover:scale-105 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h2 className="font-bold text-xl tracking-tight text-neutral-800 dark:text-white">
          Voice chat
        </h2>

        {/* Audio Mute/Unmute */}
        <button
          onClick={() => {
            if (isSpeaking && synthRef.current) {
              synthRef.current.cancel();
              setIsSpeaking(false);
            }
            setSpeechMuted(!speechMuted);
          }}
          aria-label={speechMuted ? 'Unmute speech' : 'Mute speech'}
          className="w-11 h-11 rounded-full flex items-center justify-center bg-white/80 dark:bg-white/10 text-neutral-700 dark:text-neutral-200 shadow-sm hover:scale-105 active:scale-95 transition-all"
        >
          {speechMuted ? (
            <VolumeX className="w-5 h-5 text-neutral-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          )}
        </button>
      </div>

      {/* Center: The Radiant Metallic Green Shimmering Orb */}
      <div className="flex flex-col items-center justify-center my-auto px-4 max-w-md mx-auto text-center">
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer animated pulsating waves */}
          {(isListening || isSpeaking) && (
            <>
              <div className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-emerald-400/20 dark:bg-emerald-500/25 animate-ping duration-1000" />
              <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-emerald-300/30 dark:bg-emerald-400/20 animate-pulse duration-700" />
            </>
          )}

          {/* Shimmering Metallic Sonic Orb matching Screenshot_2026-11-07-15-40-43-479 */}
          <div
            className={`w-56 h-56 sm:w-68 sm:h-68 rounded-full metallic-sonic-orb flex items-center justify-center cursor-pointer transition-transform duration-500 shadow-2xl ${
              isListening ? 'scale-105 animate-spin-slow' : isSpeaking ? 'animate-pulse-glow' : 'hover:scale-102'
            }`}
            onClick={toggleMic}
            title="Tap to speak"
          >
            {/* Inner subtle specular highlights */}
            <div className="w-16 h-16 rounded-full bg-white/40 blur-md pointer-events-none" />
          </div>
        </div>

        {/* Dynamic Speech Display or Greeting matching screenshot */}
        {liveTranscript ? (
          <div className="mb-4 p-4 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm w-full">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
              You said:
            </span>
            <p className="text-base sm:text-lg font-medium text-neutral-800 dark:text-neutral-100">
              "{liveTranscript}"
            </p>
          </div>
        ) : lastResponse ? (
          <div className="mb-4 p-4 rounded-2xl bg-white/70 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm w-full max-h-36 overflow-y-auto">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
              Bolt replied:
            </span>
            <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200">
              {lastResponse}
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            <p className="text-base sm:text-lg font-medium text-neutral-800 dark:text-neutral-100 leading-snug">
              Hello 👋 I can answer questions, explain topics, write content, or just chat. Ask me anything.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              বাংলা এবং English উভয় ভাষায় কথা বলতে পারবেন। Wake word: "<span className="font-semibold text-emerald-600 dark:text-emerald-400">{wakeWord}</span>"
            </p>
          </div>
        )}

        {/* Current Status */}
        <p
          className={`text-sm sm:text-base font-semibold transition-colors ${
            isListening
              ? 'text-emerald-600 dark:text-emerald-400 animate-pulse'
              : isSpeaking
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-emerald-700 dark:text-emerald-400'
          }`}
        >
          {statusMessage}
        </p>
      </div>

      {/* Bottom Bar matching Screenshot_2026-11-07-15-40-43-479 */}
      <div className="flex items-center justify-between max-w-sm mx-auto w-full pt-4">
        {/* Switch to Chat Mode Button */}
        <button
          onClick={() => {
            stopListening();
            if (synthRef.current) synthRef.current.cancel();
            onClose();
          }}
          aria-label="Switch to chat text mode"
          className="w-14 h-14 rounded-full flex items-center justify-center bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 shadow-md hover:scale-105 active:scale-95 transition-all border border-white/60 dark:border-neutral-700"
          title="Switch to chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Large Glowing Green Mic Button */}
        <div className="relative flex items-center justify-center">
          {isListening && (
            <div className="absolute w-20 h-20 rounded-full bg-emerald-400/30 animate-ping" />
          )}
          <button
            onClick={toggleMic}
            aria-label={isListening ? 'Stop listening' : 'Start speaking'}
            className={`w-18 h-18 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
              isListening
                ? 'bg-emerald-500 scale-105 ring-8 ring-emerald-300/40 dark:ring-emerald-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'
            }`}
          >
            {isListening ? (
              <MicOff className="w-7 h-7" />
            ) : (
              <Mic className="w-7 h-7 stroke-[2.2]" />
            )}
          </button>
        </div>

        {/* Clear Conversation Trash Button */}
        <button
          onClick={handleClear}
          aria-label="Clear voice conversation"
          className="w-14 h-14 rounded-full flex items-center justify-center bg-white/80 dark:bg-neutral-800/80 text-neutral-400 hover:text-red-500 dark:text-neutral-400 shadow-md hover:scale-105 active:scale-95 transition-all border border-white/60 dark:border-neutral-700"
          title="Clear"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
