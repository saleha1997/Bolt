import React, { useState, useEffect } from 'react';
import { getBuildWorkflowFiles } from '../utils/boltEngine';
import { downloadFullProjectZipClientSide } from '../utils/projectBundle';
import { BoltIcon } from './BoltIcon';
import {
  X,
  Download,
  Smartphone,
  Monitor,
  Github,
  CheckCircle2,
  Copy,
  FileCode,
  Sparkles,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface NativeAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NativeAppModal: React.FC<NativeAppModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [selectedFileToView, setSelectedFileToView] = useState<string>('package.json');
  const [fileMap, setFileMap] = useState<Record<string, string>>({});
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    // Fetch key project files for in-modal code inspection
    if (isOpen) {
      setIsLoadingFiles(true);
      fetch('/api/project-files')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.files) {
            setFileMap(data.files);
          }
        })
        .catch((err) => console.warn('Could not load project files map:', err))
        .finally(() => setIsLoadingFiles(false));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const workflows = getBuildWorkflowFiles();

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('PWA installation ready! You can also tap "Add to Home Screen" or "Install App" in your mobile browser menu.');
    }
  };

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Direct full repository zip download (tries server blob first, falls back to client memory)
  const handleDownloadCompleteZip = async () => {
    setIsDownloadingZip(true);
    try {
      const res = await fetch('/api/download-project-zip');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'bolt-ai-complete-github-project.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        return;
      }
    } catch (err) {
      console.warn('Server zip download failed, switching to client memory zip:', err);
    }

    try {
      await downloadFullProjectZipClientSide();
    } catch (err) {
      console.error('ZIP generation error:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const currentFileContent = fileMap[selectedFileToView] || 'Loading file content...';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] bg-white dark:bg-[#141b1f] rounded-3xl shadow-2xl border border-black/5 dark:border-white/10 flex flex-col overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/20">
          <div className="flex items-center gap-3">
            <BoltIcon size={34} />
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Bolt App Installation &amp; GitHub Files
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                APK, EXE, package.json ও GitHub Actions সম্পূর্ণ সেটআপ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close native app modal"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Home Screen Icon Confirmation Notice */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
              <BoltIcon size={24} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                  Home Screen এ Bolt Icon ১০০% দেখাবে
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  Verified
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                মোবাইলে ইনস্টল করলে হোম স্ক্রিন এবং উইন্ডোজ ডেস্কটপে মূল বোল্ট আইকন (ডার্ক স্কুইরকেলে সবুজ কাটা 'B' লোগো) অবিকল প্রদর্শিত হবে। এর জন্য <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">icon-192.png</code>, <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">icon-512.png</code> ও <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">manifest.json</code> সম্পূর্ণ কনফিগার করা রয়েছে।
              </p>
            </div>
          </div>

          {/* 1-Click Download Entire Repository ZIP */}
          <div className="p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-black/5 dark:border-white/5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Github className="w-5 h-5 text-neutral-900 dark:text-white" />
                <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                  GitHub এ পুশ করার সম্পূর্ণ প্রজেক্ট প্যাকেজ (.ZIP)
                </h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                All Files Included
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              এই জিপ ফাইলে <strong>package.json</strong>, <strong>.github/workflows (APK &amp; EXE)</strong>, <strong>সকল সোর্স কোড (src)</strong>, <strong>পাবলিক আইকন ও ব্যাকএন্ড</strong> সহ সম্পূর্ণ প্রজেক্ট একসাথে রয়েছে। এটি ডাউনলোড করে সরাসরি GitHub-এ পুশ করতে পারবেন।
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                onClick={handleDownloadCompleteZip}
                disabled={isDownloadingZip}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-md"
              >
                {isDownloadingZip ? (
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-emerald-500" />
                )}
                <span>Download Complete Project Repository (.ZIP)</span>
              </button>

              <button
                onClick={handleInstallPwa}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isPwaInstalled ? 'App Installed' : 'Install on Mobile (PWA)'}</span>
              </button>
            </div>
          </div>

          {/* Interactive File Viewer & Copy Section */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                  প্রজেক্টের ফাইল কোড ভিউয়ার (View &amp; Copy Any File):
                </span>
              </div>

              {/* File Selector Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedFileToView}
                  onChange={(e) => setSelectedFileToView(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="package.json">package.json</option>
                  <option value=".github/workflows/build-apk.yml">.github/workflows/build-apk.yml</option>
                  <option value=".github/workflows/build-exe.yml">.github/workflows/build-exe.yml</option>
                  <option value="capacitor.config.json">capacitor.config.json</option>
                  <option value="electron-main.cjs">electron-main.cjs</option>
                  <option value="electron-main.js">electron-main.js</option>
                  <option value="README.md">README.md</option>
                  <option value="public/manifest.json">public/manifest.json</option>
                  <option value="server.ts">server.ts</option>
                </select>

                <button
                  onClick={() => downloadTextFile(selectedFileToView.split('/').pop() || selectedFileToView, currentFileContent)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5 transition-colors"
                  title={`Download ${selectedFileToView}`}
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Download File</span>
                </button>

                <button
                  onClick={() => copyToClipboard('codeViewer', currentFileContent)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 border border-black/5 dark:border-white/5 flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'codeViewer' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'codeViewer' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-neutral-950 font-mono text-[11px] sm:text-xs text-neutral-200 overflow-x-auto max-h-56 select-all">
                <code>{currentFileContent}</code>
              </pre>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-2xl border border-black/5 dark:border-white/5">
            <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>GitHub-এ আপলোড করে ইনস্টল করার নিয়ম (৩টি সহজ ধাপ):</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
              <li>
                উপরের <strong>"Download Complete Project Repository (.ZIP)"</strong> বাটনে চাপ দিয়ে সম্পূর্ণ প্রজেক্ট ডাউনলোড করুন এবং আনজিপ করুন।
              </li>
              <li>
                টার্মিনালে <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">git init</code>, <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">git add .</code>, <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">git commit -m "init"</code> এবং <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">git push -u origin main</code> দিয়ে আপনার GitHub রিপোজিটরিতে পুশ করুন।
              </li>
              <li>
                GitHub-এর <strong>Actions</strong> ট্যাবে গিয়ে <strong>Build Android APK</strong> বা <strong>Build Windows EXE</strong> রান করুন। বিল্ড শেষ হলে Artifacts থেকে সরাসরি <strong>.apk</strong> ও <strong>.exe</strong> ডাউনলোড করে ইনস্টল করুন!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
