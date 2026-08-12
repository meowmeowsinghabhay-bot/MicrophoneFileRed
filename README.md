<p align="center">
  <img src="public/logo-icon.png" alt="IntelliShala" width="80" height="80" />
</p>

<h1 align="center">IntelliShala</h1>

<p align="center">
  <strong>Multilingual AI Classroom Assistant</strong><br/>
  Understand. Learn. Achieve.
</p>

<p align="center">
  <a href="https://microphone-file-red-two.vercel.app">Live Demo</a>
  ·
  <a href="#quick-start">Quick Start</a>
  ·
  <a href="#tech-stack">Tech Stack</a>
  ·
  <a href="#deployment">Deploy</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white" alt="OpenAI" />
</p>

---

## Overview

IntelliShala transforms live classroom lectures into **personalized, multilingual learning material**. Teachers record sessions, review AI-generated content, and publish structured lectures. Students join courses, follow bilingual transcripts, study notes and mindmaps, and track progress — all in their preferred language.

The product is built around a **hybrid architecture**: deterministic code handles timing, search, progress, and IDs; AI handles translation, summarization, vision, and conversational tutoring. Live speech-to-text runs entirely in the browser — no streaming API cost for transcription.

---

## What It Does

| Portal | Highlights |
|--------|------------|
| **Student** | Join courses via code, dashboard with stats, lecture viewer, bookmarks, quiz, catch-up mode |
| **Teacher** | Create courses, record live lectures, review/approve AI content, analytics & roster |
| **Live session** | Real-time captions, translation, notes, mindmap, glossary, board vision, explain-back, chat |

**Supported languages:** English, Hindi, Bangla, Arabic, Tamil, Telugu, Marathi, Spanish, French

**Learning levels:** Beginner · Standard · Advanced — tune AI output complexity across translate, notes, chat, and glossary.

---

## Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,prisma,postgres,vercel,nodejs&theme=light" alt="Core technologies" />
</p>

<p align="center">
  <img src="https://skillicons.dev/icons?i=openai,md&theme=light" alt="AI and markdown" />
</p>

### Core platform

| Technology | Role | Why we chose it |
|------------|------|-----------------|
| ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white) **Next.js 16** | Full-stack React framework | App Router, API routes, and serverless deployment on Vercel in one codebase |
| ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black) **React 19** | UI layer | Component model for complex live-session tabs and lecture viewer |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white) **TypeScript** | Type safety | Shared types across API routes, Prisma models, and Zustand stores |
| ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) **Tailwind CSS** | Styling | Utility-first design system with dark mode and responsive layouts |
| ![PostCSS](https://img.shields.io/badge/PostCSS-8-DD3A0A?style=flat-square&logo=postcss&logoColor=white) **PostCSS + Autoprefixer** | CSS pipeline | Standard Next.js CSS processing and browser compatibility |

### Data & backend

| Technology | Role | Why we chose it |
|------------|------|-----------------|
| ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white) **Prisma 5** | ORM | Type-safe queries, migrations, and a single schema for dev and production |
| ![SQLite](https://img.shields.io/badge/SQLite-dev-003B57?style=flat-square&logo=sqlite&logoColor=white) **SQLite** | Local database | Zero-config development — `npm run db:setup` and you're running |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-prod-4169E1?style=flat-square&logo=postgresql&logoColor=white) **PostgreSQL (Supabase)** | Production database | Reliable relational storage on serverless with connection pooling |
| ![Supabase](https://img.shields.io/badge/Supabase-Pooler-3ECF8E?style=flat-square&logo=supabase&logoColor=white) **Supabase Pooler** | Hosted Postgres | Transaction pooler (6543) for runtime, session pooler (5432) for setup |
| **Next.js API Routes** | REST backend | Colocated with frontend; no separate server to deploy or maintain |

### State & client persistence

| Technology | Role | Why we chose it |
|------------|------|-----------------|
| ![Zustand](https://img.shields.io/badge/Zustand-5-44336F?style=flat-square) **Zustand** | Client state | Lightweight stores for auth, live lecture session, theme, and preferences |
| **localStorage** | Offline lecture backup | Teachers/students keep local copies when DB save isn't available |

### Live capture & speech

| Technology | Role | Why we chose it |
|------------|------|-----------------|
| **Web Speech API** | Live STT | Browser-native speech recognition — free, low latency, no audio upload |
| **Custom hooks** | STT + translation pipeline | `useSpeechRecognition` and `useLiveTranslation` orchestrate capture without refactoring core logic |

### AI & language

| Technology | Role | Why we chose it |
|------------|------|-----------------|
| ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white) **OpenAI API** | Primary LLM | Notes, mindmap, chat, explain-back, exam questions, board vision |
| **LLMService** (`llm-service.ts`) | AI abstraction | Single place to swap model/provider across all AI routes |
| **MyMemory API** | Translation fallback | Free translation when `OPENAI_API_KEY` is unset |
| **Terminology tables** | Domain preservation | Keeps CS terms stable across Hindi/other translations |

### Content rendering

| Technology | Role | Why we chose it |
|------------|------|-----------------|
| ![Markdown](https://img.shields.io/badge/react--markdown-9-000000?style=flat-square&logo=markdown&logoColor=white) **react-markdown** | Rich text | Render AI-generated notes and revision content safely |
| **remark-math + rehype-katex + KaTeX** | Math rendering | Lecture formulas and equations display correctly in notes |
| **markmap-lib + markmap-view** | Mindmaps | Interactive SVG mindmaps from markdown outlines in the browser |
| **Web Speech Synthesis** | Read aloud (TTS) | Built-in browser TTS for transcript and glossary terms |

### Vision & OCR

| Technology | Role | Why we chose it |
|------------|------|-----------------|
| **OpenAI Vision** | Board analysis | Reads whiteboard photos and diagrams via GPT-4o |
| **Tesseract.js** | OCR fallback | Local OCR when vision API is unavailable (heavier on serverless) |

### Deployment & tooling

| Technology | Role | Why we chose it |
|------------|------|-----------------|
| ![Vercel](https://img.shields.io/badge/Vercel-Hosting-000000?style=flat-square&logo=vercel&logoColor=white) **Vercel** | Hosting | Native Next.js deploys, edge functions, environment variables |
| **vercel-build.mjs** | Custom build | Swaps Prisma to PostgreSQL for prod without touching committed SQLite schema |
| **tsx** | Seed runner | Run TypeScript seed script directly for demo data |
| ![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=flat-square&logo=eslint&logoColor=white) **ESLint** | Linting | Catch issues early with `eslint-config-next` |

---

## Hybrid Architecture

Not everything needs an LLM. IntelliShala separates **code** (fast, free, deterministic) from **AI** (understanding, generation).

| Feature | Method | Rationale |
|---------|--------|-----------|
| Live transcription | Code — Web Speech API | Zero cost, real-time, runs in browser |
| Important-line detection | Code — keyword heuristics | Instant flags during live capture |
| Timeline segments | Code — pause detection on timestamps | LLMs don't receive precise audio timing |
| In-lecture search | Code — string matching | Single-lecture scope; no embeddings needed |
| Bookmarks, progress, quiz scoring | Code — DB arithmetic | Pure data operations |
| Join codes & readable IDs | Code — generators/counters | Deterministic, no API calls |
| Catch-up mode | Code — timestamp filter | "What did I miss after 18:00?" needs no AI |
| Live translation | AI (+ MyMemory fallback) | Requires language understanding |
| Structured notes, revision, exam Qs | AI — LLM | Generative summarization |
| Mindmap outline | AI — LLM | Topic hierarchy inference |
| Board/diagram reading | AI — vision (+ Tesseract fallback) | Requires image understanding |
| Explain-back & chat | AI — LLM | Evaluates and answers in context |
| Glossary | AI (+ rule-based fallback) | Term extraction with level-aware simplification |

All AI routes flow through **`src/lib/llm-service.ts`**.

---

## Quick Start

### Prerequisites

- **Node.js 18+**
- **Chrome or Edge** (required for Web Speech API)
- **OpenAI API key** (optional — translation and glossary have fallbacks)

### Local development

```bash
git clone <your-repo-url>
cd MicrophoneFileRed
npm install
npm run db:setup    # SQLite schema + rich demo seed
npm run dev
```

Open **http://localhost:3000**

### Demo accounts

| Role | Username | Password | Readable ID |
|------|----------|----------|-------------|
| Student | `student` | `student123` | STU-2026-00001 |
| Teacher | `teacher` | `teacher123` | TCH-2026-00001 |

**Join codes:** `DSA26X` · `DBMS42` · `NET7K9` · `OS88P1`

Students are auto-enrolled in all demo courses on login (local seed + production repair).

---

## Routes

| Path | Audience | Purpose |
|------|----------|---------|
| `/` | Public | Landing page |
| `/login/student` | Student | Sign in |
| `/login/teacher` | Teacher | Sign in |
| `/student/dashboard` | Student | Courses, stats, join code |
| `/teacher/dashboard` | Teacher | Courses, roster, analytics |
| `/session/live` | Authenticated | Live recording & AI tabs |
| `/lecture/[id]` | Student | Full lecture viewer |
| `/teacher/lectures/[id]/review` | Teacher | Edit & approve AI blocks |
| `/api/health` | Ops | DB connectivity check |
| `/api/setup-database` | Ops | One-time production DB init |

---

## Environment Variables

Copy `.env.example` to `.env` for local development.

| Variable | Local | Production | Purpose |
|----------|-------|------------|---------|
| `DATABASE_URL` | `file:./dev.db` | Supabase pooler `:6543` | Runtime DB connection |
| `DIRECT_URL` | — | Supabase pooler `:5432` | Migrations & setup |
| `OPENAI_API_KEY` | Optional | Optional | Full AI features |
| `SETUP_SECRET` | Optional | Recommended | Protects `/api/setup-database` |

Production `DATABASE_URL` must use **`*.pooler.supabase.com:6543`** with `pgbouncer=true`. Do not use `db.*.supabase.co` on Vercel.

---

## Deployment

IntelliShala deploys to **Vercel** with **Supabase PostgreSQL**.

### 1. Connect repository

Import the repo in [Vercel](https://vercel.com/new). Build command is already set via `vercel.json`:

```json
{ "buildCommand": "npm run vercel-build" }
```

### 2. Configure Supabase

In Supabase → **Connect**, copy:

- **Transaction pooler** (port **6543**) → `DATABASE_URL`
- **Session pooler** (port **5432**) → `DIRECT_URL`

Add both to Vercel → Settings → Environment Variables.

### 3. Push schema (choose one)

**Option A — From your machine (recommended)**

```powershell
$env:DIRECT_URL="postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
npm run db:push:supabase
```

**Option B — Browser setup after first deploy**

```
https://YOUR-APP.vercel.app/api/setup-database?secret=intellishala-setup-2026
```

### 4. Verify

```
GET /api/health
```

Expected response includes `"ok": true`, `"courses": 4`, and `"enrollments": 16+`.

### 5. Log in fresh

Clear any old browser session, then sign in with `student` / `student123`. You should see four courses on the dashboard.

| | Local | Production |
|---|--------|------------|
| Database | SQLite | PostgreSQL (Supabase) |
| Setup | `npm run db:setup` | `db:push:supabase` or setup URL |
| Build | `npm run build` | `npm run vercel-build` (~2–3 min) |

---

## Project Structure

```
src/
├── app/
│   ├── api/                 # REST endpoints (auth, courses, lectures, AI)
│   ├── student/             # Student portal
│   ├── teacher/             # Teacher portal
│   ├── session/live/        # Live recording session
│   └── lecture/[id]/        # Lecture viewer
├── components/
│   ├── tabs/                # Live session tab panels
│   ├── lecture/             # Transcript, mindmap, quiz, glossary
│   └── …                    # Shell, theme, controls
├── hooks/
│   ├── useSpeechRecognition.ts   # Web Speech API (preserve logic)
│   └── useLiveTranslation.ts     # Batched translation pipeline
├── lib/
│   ├── llm-service.ts       # Central AI abstraction
│   ├── db.ts                # Prisma singleton + pooler retry
│   ├── database-url.ts      # Supabase URL normalization
│   ├── computed.ts          # Search, timeline, catch-up
│   └── terminology.ts       # Term preservation
├── store/                   # Zustand — auth, lecture, theme, preferences
prisma/
├── schema.prisma            # SQLite locally; Postgres on Vercel build
├── seed.ts                  # Rich demo data (4 courses, lectures, progress)
└── supabase-init.sql        # Production table bootstrap
scripts/
├── vercel-build.mjs         # Postgres-aware Vercel build
├── push-supabase.mjs        # Local Supabase push + seed
└── db-url.mjs               # Shared connection string helpers
```

---

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | Authenticate; auto-enrolls students |
| `GET /api/courses` | Teacher course list |
| `GET /api/courses/join` | Student enrolled courses |
| `POST /api/courses/join` | Join via code |
| `GET/POST /api/lectures` | List / create lectures |
| `GET /api/lectures/[id]` | Full lecture payload |
| `POST /api/translate` | Segment translation |
| `POST /api/generate-notes` | Structured notes |
| `POST /api/mindmap` | Mindmap markdown |
| `POST /api/glossary` | Term definitions |
| `POST /api/chat` | Grounded Q&A |
| `POST /api/explain-back` | Student explanation check |
| `POST /api/analyze-board` | Whiteboard vision |
| `GET /api/health` | Deployment health check |

---

## Known Limitations

- **Live STT:** English input only; Chrome/Edge recommended
- **AI features:** Full notes, chat, and vision need `OPENAI_API_KEY`; translation and glossary degrade gracefully without it
- **Auth:** Demo-grade username/password check — suitable for hackathons, not production security
- **Board OCR:** Tesseract may timeout on cold serverless starts; vision API is preferred in production
- **TTS voices:** Quality varies by browser and OS language packs

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Local production build (SQLite) |
| `npm run vercel-build` | Vercel build (PostgreSQL client) |
| `npm run db:setup` | Push schema + seed SQLite |
| `npm run db:push:supabase` | Push schema + seed Supabase |
| `npm run lint` | ESLint |

---

## License

This project was built for educational and hackathon use. Adapt and extend as needed.

---

<p align="center">
  <sub>IntelliShala — making every lecture understandable, in every language.</sub>
</p>
