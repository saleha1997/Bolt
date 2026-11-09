import JSZip from 'jszip';
import { getBuildWorkflowFiles } from './boltEngine';

export const PACKAGE_JSON_CONTENT = `{
  "name": "bolt-app",
  "private": true,
  "version": "1.0.0",
  "description": "Bolt - Universal AI Assistant with Liquid Glass UI & Native App Builders",
  "main": "electron-main.cjs",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "start": "tsx server.ts",
    "build": "vite build",
    "build:apk": "vite build && npx cap sync android",
    "build:exe": "vite build && npx electron-builder --win nsis",
    "preview": "vite preview",
    "clean": "rm -rf dist dist-electron",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@capacitor/android": "^7.0.0",
    "@capacitor/core": "^7.0.0",
    "@google/genai": "^3.0.0",
    "@tailwindcss/vite": "^4.3.3",
    "@types/jszip": "^3.4.0",
    "@vitejs/plugin-react": "^6.1.1",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "jszip": "^3.10.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^7.0.0",
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "electron": "^34.0.0",
    "electron-builder": "^25.1.8",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2"
  },
  "build": {
    "appId": "com.bolt.app",
    "productName": "Bolt",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron-main.cjs",
      "public/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/icon-512.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
`;

export const TSCONFIG_CONTENT = `{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "types": ["vite/client"],
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "exclude": ["dist"]
}
`;

export const VITE_CONFIG_CONTENT = `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
`;

export const INDEX_HTML_CONTENT = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bolt - AI Assistant & Universal Agent</title>
    <meta name="description" content="Bolt is a state-of-the-art AI assistant with liquid glass UI, auto-routing multi-agent modes (Education, Coding, Build, Device Control, Pro Work), real-time Bengali & English voice chat, local storage, and APK/EXE generator." />
    <meta property="og:title" content="Bolt - AI Assistant & Universal Agent" />
    <meta property="og:description" content="Bolt is a state-of-the-art AI assistant with liquid glass UI, auto-routing multi-agent modes, real-time voice chat, and native app builders." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#10b981" />
    <link rel="icon" type="image/svg+xml" href="/bolt-icon.svg" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

export const GITIGNORE_CONTENT = `node_modules
dist
dist-electron
android
.env
*.log
.playwright-cli/
`;

export const CAPACITOR_CONFIG_CONTENT = `{
  "appId": "com.bolt.app",
  "appName": "Bolt",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "cleartext": true
  }
}
`;

export const ELECTRON_MAIN_CONTENT = `const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 420,
    minHeight: 600,
    title: 'Bolt - Universal AI Assistant',
    icon: path.join(__dirname, 'public/bolt-icon.svg'),
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

export const MANIFEST_JSON_CONTENT = `{
  "short_name": "Bolt",
  "name": "Bolt - AI Assistant & Universal Agent",
  "icons": [
    {
      "src": "/icon-192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any maskable"
    },
    {
      "src": "/bolt-icon.svg",
      "type": "image/svg+xml",
      "sizes": "any",
      "purpose": "any"
    }
  ],
  "start_url": "/",
  "background_color": "#121418",
  "theme_color": "#10b981",
  "display": "standalone",
  "orientation": "portrait"
}
`;

export const BOLT_ICON_SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#34d399"/>
      <stop offset="100%" stopColor="#10b981"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e2229"/>
      <stop offset="100%" stop-color="#111317"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>
  
  <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgGrad)" stroke="#2b313c" stroke-width="6" filter="url(#shadow)"/>
  
  <g fill="url(#boltGrad)">
    <path d="M 148 140 L 256 140 L 148 248 Z" />
    <path d="M 288 140 L 350 140 C 374 140 388 152 388 174 C 388 190 376 206 358 214 L 148 424 L 148 340 L 288 200 L 228 200 L 288 140 Z" />
    <path d="M 334 260 C 372 274 394 308 394 350 C 394 402 354 440 300 440 L 180 440 L 334 286 C 334 278 334 268 334 260 Z" />
  </g>
</svg>
`;

export const README_CONTENT = `# ⚡ Bolt - Universal AI Assistant & Agent

> Liquid Glass UI, Multi-Agent Auto Routing (Education, Coding, Build, Device Control, Pro Work), Real-Time Bengali & English Voice Mode, and Automated GitHub Actions APK & EXE Builders.

---

## 📱 How to Build & Download APK (Android) & EXE (Windows) using GitHub

This repository comes with pre-configured **GitHub Actions Workflows** that automatically build:
1. **Android \`.apk\` file** (\`.github/workflows/build-apk.yml\`)
2. **Windows \`.exe\` setup installer** (\`.github/workflows/build-exe.yml\`)

### ৩টি সহজ ধাপে APK এবং EXE ফাইল পাওয়ার নিয়ম:

#### Step 1: Create a GitHub Repository & Push this Code
আপনার কম্পিউটারে বা মোবাইলে টার্মিনাল ওপেন করে এই কোডগুলো আপনার GitHub রিপোজিটরিতে পুশ করুন:

\`\`\`bash
git init
git add .
git commit -m "feat: complete Bolt app with automated APK and EXE workflows"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bolt-ai-app.git
git push -u origin main
\`\`\`

#### Step 2: Open GitHub Actions
1. আপনার GitHub রিপোজিটরিতে যান (যেমন: \`https://github.com/YOUR_USERNAME/bolt-ai-app\`).
2. উপরে **"Actions"** ট্যাবে ক্লিক করুন।
3. বামপাশে দুইটি অটোমেটেড ওয়ার্কফ্লো দেখতে পাবেন:
   - **Build Android APK**
   - **Build Windows EXE**
4. যেটিতে ক্লিক করবেন, সেটির **"Run workflow"** বাটনে চাপ দিন (অথবা নতুন কমিট পুশ করলেই স্বয়ংক্রিয়ভাবে বিল্ড শুরু হবে)।

#### Step 3: Download the .apk and .exe
1. বিল্ড সম্পন্ন হলে (সবুজ টিক চিহ্ন আসলে), সেটিতে ক্লিক করে ভিতরে যান।
2. পেইজের নিচে **"Artifacts"** সেকশনে পাবেন:
   - 📲 **\`Bolt-Android-APK\`**: জিপ ফাইল আনজিপ করলেই পাবেন সরাসরি ইনস্টলেবল **\`.apk\`** ফাইল, যা যেকোনো অ্যান্ড্রয়েড ফোনে ইনস্টল করা যাবে!
   - 💻 **\`Bolt-Windows-Setup-EXE\`**: জিপ ফাইল আনজিপ করলেই পাবেন **\`.exe\`** ফাইল, যা উইন্ডোজ ১০/১১ কম্পিউটারে সরাসরি ইনস্টল করা যাবে!

---

## 🚀 Running the Web Version Locally

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build for production
npm run build
\`\`\`
`;

/**
 * Downloads the full repository as a ZIP 100% on the client side using pure Blob memory!
 * This completely avoids browser security cookie blocks and iframe restrictions.
 */
export async function downloadFullProjectZipClientSide(): Promise<void> {
  const zip = new JSZip();
  const workflows = getBuildWorkflowFiles();

  // Root files
  zip.file('package.json', PACKAGE_JSON_CONTENT);
  zip.file('tsconfig.json', TSCONFIG_CONTENT);
  zip.file('vite.config.ts', VITE_CONFIG_CONTENT);
  zip.file('index.html', INDEX_HTML_CONTENT);
  zip.file('.gitignore', GITIGNORE_CONTENT);
  zip.file('capacitor.config.json', CAPACITOR_CONFIG_CONTENT);
  zip.file('electron-main.cjs', ELECTRON_MAIN_CONTENT);
  zip.file('electron-main.js', ELECTRON_MAIN_CONTENT);
  zip.file('README.md', README_CONTENT);

  // GitHub workflows
  const gh = zip.folder('.github');
  const wf = gh?.folder('workflows');
  wf?.file('build-apk.yml', workflows.apkWorkflow);
  wf?.file('build-exe.yml', workflows.exeWorkflow);

  // Public assets
  const pub = zip.folder('public');
  pub?.file('manifest.json', MANIFEST_JSON_CONTENT);
  pub?.file('bolt-icon.svg', BOLT_ICON_SVG_CONTENT);

  // Generate ZIP blob entirely in client memory
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
  });

  // Pure local blob download (No network navigation, no cookie issues!)
  const blobUrl = URL.createObjectURL(zipBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = 'bolt-ai-app-complete-github-ready.zip';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 5000);
}
