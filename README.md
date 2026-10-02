# 🚀 Online Pad

A modern, real-time collaborative text editor and scratchpad built with a serverless architecture, Material Design 3, and rich productivity tools.

[![Live Demo](https://img.shields.io/badge/demo-online--pad-blue?style=for-the-badge)](https://matin676.github.io/online-pad)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

---

## ✨ Features

- **⚡ Real-Time Synchronization**: Instant peer-to-peer style updates powered by Firebase Cloud Firestore.
- **🛡️ Race-Free Auto-Save**: Debounced persistence with intelligent local/remote timestamp arbitration to eliminate cursor jumps and write conflicts.
- **👁️ Markdown Preview**: Live formatted Markdown rendering (GitHub Flavored Markdown) with side-by-side desktop view and single-tap mobile toggle.
- **🔍 Find & Replace**: Interactive search panel with match counter, next/previous navigation, case sensitivity toggle, and single or global replacement (`Ctrl+H`).
- **🕒 Version History**: Browse chronological revision snapshots with character counts, relative timestamps, and one-click restoration.
- **📱 QR Code Sharing**: Generate and download high-resolution QR codes to open pads on mobile devices instantly.
- **⏱️ Auto-Expiry (Self-Destruct)**: Schedule pads to automatically expire in 1 hour, 24 hours, 7 days, 30 days, or persist indefinitely.
- **🔒 Read-Only Lock**: Toggle pad edit lock to prevent accidental overwrites or freeze shared reference documents.
- **📋 1-Click Clipboard Copy**: One-tap copy button for the entire pad contents with robust desktop and mobile fallbacks.
- **📂 File Import & Export**:
  - Drag-and-drop or upload code/text files directly into the editor.
  - Download documents locally as `.txt` or `.md`.
- **📱 Mobile-Optimized Menu System**:
  - Compact, overflow-free mobile toolbar.
  - Full-featured slide-out action drawer where every option displays its icon, name, and explanatory description.
- **🧘 Zen Mode**: Distraction-free full-screen writing mode (`F11`).
- **👥 Live Collaborator Presence**: Real-time counter of active users currently editing the pad.
- **📜 Line Numbers**: Toggleable gutter line numbers aligned with monospace typography (`Ctrl+Shift+L`).
- **🌓 Dark / Light Theme & Accents**: System-aware dark/light theme switching with custom accent colors.
- **📑 Recent Documents**: Instant access to recently visited pads stored locally.

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 18 (TypeScript) |
| **Build & Bundler** | Vite 8 + Rolldown (Optimized manual chunk splitting) |
| **UI Components** | Material UI (MUI) 7 with custom Material Design 3 theme |
| **Icons** | Lucide React |
| **Database & Realtime** | Firebase Cloud Firestore |
| **Markdown Engine** | `react-markdown` + `remark-gfm` |
| **Routing** | React Router v7 (`HashRouter` for GitHub Pages compatibility) |
| **Deployment** | GitHub Pages (`gh-pages`) |

---

## 🏗 Project Architecture

```
online-pad/
├── src/
│   ├── app/                    # Root application entry and router setup
│   │   ├── App.tsx
│   │   └── App.css
│   ├── components/             # Shared application components
│   │   └── common/
│   │       ├── PresenceIndicator.tsx
│   │       ├── RecentPads.tsx
│   │       └── ThemeToggle.tsx
│   ├── features/               # Modular feature-driven domains
│   │   ├── editor/
│   │   │   ├── components/     # EditorView, MarkdownPreview, FindReplace, etc.
│   │   │   └── hooks/          # useDocument (auto-save, debounce, expiry)
│   │   └── landing/
│   │       └── components/     # LandingPage (pad slug creation)
│   ├── services/               # Firebase initialization and service layer
│   │   └── firebase.ts
│   ├── theme/                  # MUI theme palette, typography, and overrides
│   │   └── index.ts
│   ├── index.css               # Global CSS tokens and scrollbar styles
│   └── main.tsx                # Application bootstrap
├── .env.example                # Template for environment configuration
├── vite.config.ts              # Vite 8 config with vendor chunk splitting
├── tsconfig.json               # TypeScript compiler options
└── package.json                # Project dependencies and deployment scripts
```

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/matin676/online-pad.git
cd online-pad
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase credentials in `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🚀 Production Build & Deployment

### Type Checking
Ensure TypeScript compiles with zero errors:
```bash
npm run typecheck
```

### Build for Production
```bash
npm run build
```
The output will be bundled and minified in the `dist/` directory with code splitting:
- `vendor-react`: React, React DOM, React Router
- `vendor-mui`: Material UI & Emotion
- `vendor-firebase`: Firebase App & Firestore
- `vendor-utils`: Markdown and icon utilities

### Local Production Preview
Test the production build locally:
```bash
npm run preview
```

### Deploy to GitHub Pages
To deploy the latest build to GitHub Pages:
```bash
npm run deploy
```
*(Runs `npm run build` automatically via the `predeploy` hook and publishes `dist/` to the `gh-pages` branch).*

---

## ⌨️ Keyboard Shortcuts

| Shortcut (Windows / Linux) | Shortcut (macOS) | Action |
|---|---|---|
| `Ctrl + S` | `⌘ Cmd + S` | Prevent browser save dialog & confirm auto-save status |
| `Ctrl + H` / `Ctrl + Shift + F` | `⌘ Cmd + H` / `⌘ Cmd + Shift + F` | Toggle Find & Replace panel |
| `Ctrl + Shift + P` / `Alt + P` | `⌘ Cmd + Shift + P` / `⌥ Opt + P` | Toggle Markdown Preview mode |
| `Ctrl + Shift + L` / `Alt + L` | `⌘ Cmd + Shift + L` / `⌥ Opt + L` | Toggle Line Numbers gutter |
| `F11` / `Ctrl + Shift + Z` / `Alt + Z` | `⌘ Cmd + Shift + Z` / `F11` | Toggle Zen Mode (Full screen) |
| `Tab` | `Tab` | Indent 2 spaces (without losing editor focus) |
| `Shift + Tab` | `Shift + Tab` | Outdent 2 spaces from selected lines |
| `Escape` | `Escape` | Close Find & Replace panel |

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
