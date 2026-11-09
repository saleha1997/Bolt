/**
 * Bolt Universal Engine Core Utilities
 * Pure deterministic functions for mode detection, wake word handling,
 * chat session management, and APK/EXE configuration generators.
 */

export type BoltMode = 'auto' | 'fast' | 'education' | 'coding' | 'build' | 'device' | 'pro';
export type ReasoningLevel = 'instant' | 'fast' | 'thinking' | 'pro' | 'max';
export type ThemeType = 'lavender' | 'midnight' | 'mint' | 'custom';
export type VoiceLanguage = 'english' | 'bengali' | 'auto';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bolt';
  text: string;
  timestamp: number;
  mode?: BoltMode;
  reasoning?: ReasoningLevel;
  codeBlock?: string;
  interactivePreview?: string;
  isVoice?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  projectId?: string;
  messages: ChatMessage[];
}

export interface ProjectItem {
  id: string;
  name: string;
  createdAt: number;
  description?: string;
}

export interface AIProviderSlot {
  id: number;
  name: string;
  modeKey: string;
  provider: 'openai' | 'gemini' | 'openrouter' | 'claude' | 'custom';
  apiKey: string;
  model: string;
  baseUrl: string;
  configured: boolean;
}

export interface AppSettings {
  theme: ThemeType;
  customAccentColor: string;
  sidebarLayout: 'left' | 'right';
  voiceLanguage: VoiceLanguage;
  wakeWord: string;
  wakeTextEnabled: boolean;
  speechToTextUrl: string;
  speechToTextKey: string;
  speechToTextModel: string;
  aiSlots: AIProviderSlot[];
}

/**
 * Automatically detects the best mode for Auto Mode routing
 */
export function detectOptimalMode(query: string): BoltMode {
  const q = query.toLowerCase();

  // Device control queries (laptop, mouse, keyboard, phone, troubleshoot, crm, drive, lock, alarm)
  if (
    /\b(laptop|desktop|computer|mouse|keyboard|drive|folder|crm|calendar|troubleshoot|device|setting|alarm|phone)\b|screen\s*control/i.test(q) ||
    /কাজ করতে পারতেছিনা|ল্যাপটপ|ড্রাইভ|মাউস|কিবোর্ড|স্ক্রিন/i.test(q)
  ) {
    return 'device';
  }

  // Build queries (apps, 3D, games, music, interactive prototypes)
  if (
    /\b(build|banaw|banao|game|games|3d|three\.js|music|synth|preview)\b|make app|create app|বানাও|গেম|মিউজিক|থ্রিডি/i.test(q)
  ) {
    return 'build';
  }

  // Coding queries (code, function, python, javascript, typescript, qr code, terminal, patch, bug, fix error)
  if (
    /\b(code|coding|programming|python|typescript|javascript|react|terminal|script|regex|function|api|debug|syntax|bug)\b|qr\s*code|কোড|কিউআর/i.test(q)
  ) {
    return 'coding';
  }

  // Education queries (math, science, physics, frontier, arc-agi, formula, guide, explain, solve, answer with steps)
  if (
    /\b(math|gonit|science|physics|chemistry|arc-agi|frontier|calculate|solve|equation|theorem|question|study|guide)\b|গণিত|বিজ্ঞান|সমাধান|থিওরি/i.test(q)
  ) {
    return 'education';
  }

  // Pro work queries (report, spreadsheet, presentation, table, research, calculation, invoice, business plan)
  if (
    /\b(report|spreadsheet|excel|presentation|slide|table|summary|research|calculation|invoice)\b|business\s*plan|হিসাব|রিপোর্ট|স্প্রেডশিট|টেবিল/i.test(q)
  ) {
    return 'pro';
  }

  return 'fast';
}

/**
 * Checks if spoken or typed phrase triggers the wake word
 */
export function matchWakeWord(text: string, wakeTrigger: string = 'bolt'): { isWake: boolean; isStop: boolean } {
  const cleaned = text.trim().toLowerCase();
  const trigger = wakeTrigger.trim().toLowerCase();

  const isStop = cleaned.includes(`${trigger} off`) || cleaned.includes(`${trigger} stop`) || cleaned.includes(`${trigger} bondho`);
  const isWake = cleaned.startsWith(trigger) || cleaned.includes(`hey ${trigger}`) || cleaned.includes(`ok ${trigger}`) || cleaned === trigger;

  return { isWake, isStop };
}

/**
 * Toggles pin status on a session
 */
export function togglePinSession(sessions: ChatSession[], sessionId: string): ChatSession[] {
  return sessions.map((session) => {
    if (session.id === sessionId) {
      return { ...session, pinned: !session.pinned, updatedAt: Date.now() };
    }
    return session;
  });
}

/**
 * Deletes a session from list
 */
export function removeSession(sessions: ChatSession[], sessionId: string): ChatSession[] {
  return sessions.filter((session) => session.id !== sessionId);
}

/**
 * Generates initial default settings matching Bolt specifications
 */
export function getDefaultSettings(): AppSettings {
  return {
    theme: 'midnight',
    customAccentColor: '#10b981',
    sidebarLayout: 'left',
    voiceLanguage: 'english',
    wakeWord: 'Bolt',
    wakeTextEnabled: true,
    speechToTextUrl: 'https://openrouter.ai/api/v1',
    speechToTextKey: '',
    speechToTextModel: 'openrouter/free',
    aiSlots: [
      {
        id: 1,
        name: 'Education',
        modeKey: 'education',
        provider: 'gemini',
        apiKey: '',
        model: 'gemini-3.8-flash',
        baseUrl: 'https://openrouter.ai/api/v1',
        configured: false,
      },
      {
        id: 2,
        name: 'Coding',
        modeKey: 'coding',
        provider: 'gemini',
        apiKey: '',
        model: 'gemini-3.8-flash',
        baseUrl: 'https://openrouter.ai/api/v1',
        configured: false,
      },
      {
        id: 3,
        name: 'Build',
        modeKey: 'build',
        provider: 'gemini',
        apiKey: '',
        model: 'gemini-3.8-flash',
        baseUrl: 'https://openrouter.ai/api/v1',
        configured: false,
      },
      {
        id: 4,
        name: 'Device control',
        modeKey: 'device',
        provider: 'gemini',
        apiKey: '',
        model: 'gemini-3.8-flash',
        baseUrl: 'https://openrouter.ai/api/v1',
        configured: false,
      },
      {
        id: 5,
        name: 'Deep work',
        modeKey: 'pro',
        provider: 'gemini',
        apiKey: '',
        model: 'gemini-3.8-flash',
        baseUrl: 'https://openrouter.ai/api/v1',
        configured: false,
      },
      {
        id: 6,
        name: 'Voice',
        modeKey: 'auto',
        provider: 'gemini',
        apiKey: '',
        model: 'gemini-3.8-flash',
        baseUrl: 'https://openrouter.ai/api/v1',
        configured: false,
      },
    ],
  };
}

/**
 * Returns GitHub Actions Workflow files for automated APK & EXE compilation
 */
export function getBuildWorkflowFiles(): {
  apkWorkflow: string;
  exeWorkflow: string;
  electronMain: string;
  capacitorConfig: string;
} {
  const apkWorkflow = `name: Build Android APK
on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-android-apk:
    name: Build Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Project Dependencies
        run: npm install --legacy-peer-deps

      - name: Build Web Application
        run: npm run build

      - name: Initialize & Sync Capacitor Android
        run: |
          npx cap add android || true
          npx cap sync android

      - name: Grant Execute Permission for Gradlew
        run: |
          if [ -f "android/gradlew" ]; then
            chmod +x android/gradlew
          fi

      - name: Build Android Debug APK
        working-directory: android
        run: ./gradlew assembleDebug --no-daemon --stacktrace

      - name: Upload Installable APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: Bolt-Android-APK
          path: android/app/build/outputs/apk/debug/*.apk
          retention-days: 30
`;

  const exeWorkflow = `name: Build Windows EXE
on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-windows-exe:
    name: Build Windows .exe Installer
    runs-on: windows-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Project Dependencies
        run: npm install --legacy-peer-deps

      - name: Build Web Application
        run: npm run build

      - name: Build Windows .exe with Electron Builder
        run: npx electron-builder --win nsis --publish never
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}

      - name: Upload Windows EXE Installer Artifact
        uses: actions/upload-artifact@v4
        with:
          name: Bolt-Windows-Setup-EXE
          path: dist-electron/*.exe
          retention-days: 30
`;

  const electronMain = `const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 420,
    minHeight: 600,
    title: 'Bolt - Universal AI Assistant',
    icon: path.join(__dirname, 'public/icon-512.png'),
    backgroundColor: '#0c151c',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Remove standard menu bar for sleek modern app look
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
`;

  const capacitorConfig = `{
  "appId": "com.bolt.app",
  "appName": "Bolt",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  }
}
`;

  return { apkWorkflow, exeWorkflow, electronMain, capacitorConfig };
}
