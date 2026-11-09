# ⚡ Bolt - Universal AI Assistant & Agent

> Liquid Glass UI, Multi-Agent Auto Routing (Education, Coding, Build, Device Control, Pro Work), Real-Time Bengali & English Voice Mode, and Automated GitHub Actions APK & EXE Builders.

---

## 📱 How to Build & Download APK (Android) & EXE (Windows) using GitHub

This repository comes with pre-configured **GitHub Actions Workflows** that automatically build:
1. **Android `.apk` file** (`.github/workflows/build-apk.yml`)
2. **Windows `.exe` setup installer** (`.github/workflows/build-exe.yml`)

### ৩টি সহজ ধাপে APK এবং EXE ফাইল পাওয়ার নিয়ম:

#### Step 1: Create a GitHub Repository & Push this Code
আপনার কম্পিউটারে বা মোবাইলে টার্মিনাল ওপেন করে এই কোডগুলো আপনার GitHub রিপোজিটরিতে পুশ করুন:

```bash
git init
git add .
git commit -m "feat: complete Bolt app with automated APK and EXE workflows"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bolt-ai-app.git
git push -u origin main
```

#### Step 2: Open GitHub Actions
1. আপনার GitHub রিপোজিটরিতে যান (যেমন: `https://github.com/YOUR_USERNAME/bolt-ai-app`).
2. উপরে **"Actions"** ট্যাবে ক্লিক করুন।
3. বামপাশে দুইটি অটোমেটেড ওয়ার্কফ্লো দেখতে পাবেন:
   - **Build Android APK**
   - **Build Windows EXE**
4. যেটিতে ক্লিক করবেন, সেটির **"Run workflow"** বাটনে চাপ দিন (অথবা নতুন কমিট পুশ করলেই স্বয়ংক্রিয়ভাবে বিল্ড শুরু হবে)।

#### Step 3: Download the .apk and .exe
1. বিল্ড সম্পন্ন হলে (সবুজ টিক চিহ্ন আসলে), সেটিতে ক্লিক করে ভিতরে যান।
2. পেইজের নিচে **"Artifacts"** সেকশনে পাবেন:
   - 📲 **`Bolt-Android-APK`**: জিপ ফাইল আনজিপ করলেই পাবেন সরাসরি ইনস্টলেবল **`.apk`** ফাইল, যা যেকোনো অ্যান্ড্রয়েড ফোনে ইনস্টল করা যাবে!
   - 💻 **`Bolt-Windows-Setup-EXE`**: জিপ ফাইল আনজিপ করলেই পাবেন **`.exe`** ফাইল, যা উইন্ডোজ ১০/১১ কম্পিউটারে সরাসরি ইনস্টল করা যাবে!

---

## 🚀 Running the Web Version Locally

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🌟 Key Features

- **Liquid Glass Interface**: Lavender, Midnight, and Mint themes.
- **Auto Multi-Agent Routing**: Education, Coding, Build (with runnable HTML/3D sandbox), Device Control (with simulated terminal), and Pro Work.
- **Voice Mode**: Radiant metallic sonic orb, bilingual Bengali and English speech recognition, and spoken audio replies.
- **History Management**: Local device storage with pin and "Sure?" delete confirmation.
- **6 AI Provider Slots**: Custom keys and models for each agent.
