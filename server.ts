import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import JSZip from 'jszip';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_PROMPTS: Record<string, string> = {
  auto: `You are Bolt, the most powerful universal AI assistant and multi-agent system.
You automatically detect the user's intent and seamlessly switch between Education (deep STEM/ARC-AGI/Frontier Math), Coding (software engineering, QR codes, scripts), Build (interactive apps, games, 3D previews), Device Control (computer use, mouse/keyboard step execution, OS troubleshooting), and Deep Pro Work.
CRITICAL: You are fluent in both Bengali (বাংলা) and English. If the user asks in Bengali or Banglish (e.g. 'kemon aso', 'ki khobor', 'kaje sahajjo koro'), respond naturally in fluent, helpful Bengali (or Banglish if colloquial), with crystal-clear explanations.
Format responses cleanly with markdown, code blocks, structured sections, and concise summaries.`,

  education: `You are Bolt Education Specialist.
Specialized in deep Science, Frontier Mathematics (scoring 98%+ capability) and ARC-AGI-3 reasoning (99.9% score benchmark).
When explaining any topic or question:
1. Provide a beautiful visual/illustrated conceptual breakdown (using ASCII art, structured diagrams, math formulas, or markdown tables).
2. Give clear step-by-step explanatory logic explaining the 'why'.
3. Always offer 1-2 related practice questions + answers (same type) to reinforce understanding.
Support both English and Bengali (বাংলা) fluently.`,

  coding: `You are Bolt Software Engineering Agent.
Highly capable coding expert. You handle large codebases, write complete runnable code, terminal commands, patch diffs, QR code generation scripts, regex, algorithms, and web applications.
Always write clean, production-grade code with comments and execution instructions. Support English and Bengali.`,

  build: `You are Bolt Builder.
You build complete web apps, mini games, 3D interactive scenes (Three.js/Canvas), musical synthesizers, and multimedia projects.
Whenever requested to build something, provide runnable interactive code (HTML/CSS/JS or React) that can be previewed directly in the client sandbox. Provide complete code without placeholders.`,

  device: `You are Bolt Device Control & Computer Use Specialist.
You help users control laptops, computers, and smartphones, fixing problems, automating tasks (screen inspection, simulated mouse clicks, keyboard shortcuts, CRM updates, calendar management, software troubleshooting, disk drive creation, system settings).
Provide exact step-by-step OS commands (Windows cmd/PowerShell, macOS terminal, Android settings) and structured execution action steps:
- Action: [Click/Type/Hotkey/Run]
- Target: [Component/Path]
- Result: [Expected Outcome]`,

  pro: `You are Bolt Deep Professional Work Agent.
You generate executive reports, structured spreadsheet tables, presentation outlines, market research, business plans, and financial calculations following professional business templates.`,

  fast: `You are Bolt Fast. You give lightning-fast, concise, accurate, direct answers with zero fluff.`
};

// API: Chat endpoint
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      prompt,
      history = [],
      mode = 'auto',
      reasoning = 'fast',
      language = 'auto',
      customProvider
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Check if custom provider is specified and configured with an API key
    if (customProvider && customProvider.apiKey && customProvider.apiKey.trim() !== '') {
      try {
        const baseUrl = (customProvider.baseUrl || 'https://openrouter.ai/api/v1').replace(/\/+$/, '');
        const modelName = customProvider.model || 'google/gemini-2.5-flash';
        
        const openAiMessages = [
          { role: 'system', content: SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.auto },
          ...history.map((m: any) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          { role: 'user', content: prompt }
        ];

        const providerResp = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${customProvider.apiKey.trim()}`
          },
          body: JSON.stringify({
            model: modelName,
            messages: openAiMessages
          })
        });

        if (providerResp.ok) {
          const pData = await providerResp.json();
          const replyText = pData.choices?.[0]?.message?.content || 'No response from custom provider.';
          res.json({
            text: replyText,
            provider: 'custom',
            mode
          });
          return;
        }
      } catch (custErr) {
        console.warn('Custom provider failed, falling back to server Gemini:', custErr);
      }
    }

    // Default to Gemini API
    if (!aiClient) {
      if (process.env.GEMINI_API_KEY) {
        aiClient = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
        });
      } else {
        res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.'
        });
        return;
      }
    }

    const systemInstruction = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.auto;

    let thinkingLevel: ThinkingLevel | undefined;
    if (reasoning === 'thinking' || reasoning === 'pro') {
      thinkingLevel = ThinkingLevel.HIGH;
    } else if (reasoning === 'fast' || reasoning === 'instant') {
      thinkingLevel = ThinkingLevel.LOW;
    }

    // Build contents from history and current prompt
    const contents: any[] = [];
    for (const h of history.slice(-6)) {
      contents.push({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const modelToUse = reasoning === 'max' ? 'gemini-3.8-flash' : 'gemini-3.8-flash';

    const response = await aiClient.models.generateContent({
      model: modelToUse,
      contents,
      config: {
        systemInstruction: `${systemInstruction}\nUser preferred language context: ${language}. Always maintain high precision and helpfulness.`,
        thinkingConfig: thinkingLevel ? { thinkingLevel } : undefined
      }
    });

    const responseText = response.text || 'I have processed your request.';
    res.json({
      text: responseText,
      provider: 'gemini',
      mode,
      reasoning
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process AI request. Please try again.'
    });
  }
});

// API: Device Simulation Execution Sandbox
app.post('/api/device-simulate', (req: Request, res: Response) => {
  const { command, type } = req.body;
  // Simulates computer-use actions, mouse movement, terminal execution
  const timestamp = new Date().toLocaleTimeString();
  res.json({
    status: 'success',
    executedAt: timestamp,
    action: type || 'command',
    command,
    logs: [
      `[${timestamp}] Bolt Agent initialized sandbox environment`,
      `[${timestamp}] Executing target: "${command}"`,
      `[${timestamp}] Verifying device state & permissions: GRANTED`,
      `[${timestamp}] Task completed successfully with exit code 0`
    ]
  });
});

// API: Get complete map of key project files for viewing and copying
app.get('/api/project-files', (_req: Request, res: Response) => {
  const root = __dirname;
  const filesToRead = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'capacitor.config.json',
    'electron-main.cjs',
    'electron-main.js',
    'README.md',
    '.github/workflows/build-apk.yml',
    '.github/workflows/build-exe.yml',
    'public/manifest.json',
    'server.ts'
  ];

  const result: Record<string, string> = {};
  for (const rel of filesToRead) {
    const full = path.join(root, rel);
    if (fs.existsSync(full)) {
      result[rel] = fs.readFileSync(full, 'utf-8');
    }
  }

  res.json({ files: result });
});

// API: Download complete repository ZIP containing all source code and GitHub workflows
app.get('/api/download-project-zip', async (_req: Request, res: Response): Promise<void> => {
  try {
    const zip = new JSZip();
    const rootDir = __dirname;

    // Helper function to recursively add files to zip
    const addDirToZip = (dirPath: string, zipFolder: JSZip) => {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        if (
          item === 'node_modules' ||
          item === 'dist' ||
          item === 'dist-electron' ||
          item === '.git' ||
          item === '.playwright-cli' ||
          item.endsWith('.log') ||
          item === '.env' ||
          item === '.env.example'
        ) {
          continue;
        }

        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          if (subFolder) addDirToZip(fullPath, subFolder);
        } else {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(item, content);
        }
      }
    };

    addDirToZip(rootDir, zip);

    // Explicitly ensure .github/workflows are added
    const ghDir = path.join(rootDir, '.github');
    if (fs.existsSync(ghDir)) {
      const ghFolder = zip.folder('.github');
      if (ghFolder) addDirToZip(ghDir, ghFolder);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="bolt-ai-complete-github-project.zip"');
    res.send(zipBuffer);
  } catch (err: any) {
    console.error('Failed to create project zip:', err);
    res.status(500).json({ error: 'Failed to generate project zip bundle' });
  }
});

// Production static file serving or Dev Vite mounting
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Bolt server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
