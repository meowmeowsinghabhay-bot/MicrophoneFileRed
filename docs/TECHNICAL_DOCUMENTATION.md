# IntelliShala — Technical Documentation & Evaluation Guide

> Complete reference for architecture decisions, technology choices, alternatives, and likely judge/interviewer questions.

**Related:** [README](../README.md) · [Live Demo](https://microphone-file-red-two.vercel.app)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Choices (Deep Dive)](#3-technology-choices-deep-dive)
4. [Hybrid AI vs Code Design](#4-hybrid-ai-vs-code-design)
5. [Data Model & Persistence](#5-data-model--persistence)
6. [Key Application Flows](#6-key-application-flows)
7. [Deployment & Infrastructure](#7-deployment--infrastructure)
8. [Security & Limitations (Honest Assessment)](#8-security--limitations-honest-assessment)
9. [Evaluation Q&A Bank](#9-evaluation-qa-bank)
10. [Demo Script for Judges](#10-demo-script-for-judges)
11. [Future Improvements](#11-future-improvements)

---

## 1. Executive Summary

**IntelliShala** is a multilingual AI classroom assistant that:

- Captures **live lecture audio** via the browser and converts it to text in real time
- **Translates** captions into 9 target languages
- Generates **notes, mindmaps, glossaries, quiz questions, and revision material** using LLMs
- Provides separate **teacher** and **student** portals backed by a relational database
- Deploys as a **serverless Next.js app** on Vercel with **Supabase PostgreSQL** in production

**Core design principle:** Use **code** for anything deterministic (timestamps, search, progress, IDs) and **AI** only where language understanding or generation is required. This reduces cost, latency, and hallucination risk.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Web Speech   │  │ Zustand      │  │ Markmap      │  │ Web Speech  │ │
│  │ API (STT)    │  │ Stores       │  │ (Mindmap)    │  │ Synthesis   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │ (TTS)       │ │
│         │                 │                             └─────────────┘ │
└─────────┼─────────────────┼─────────────────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 16 (App Router)                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ API Routes  /api/auth  /api/lectures  /api/translate  /api/chat │   │
│  └──────────────────────────────┬──────────────────────────────────┘   │
│                                 │                                        │
│  ┌──────────────┐  ┌────────────▼────────────┐  ┌─────────────────────┐ │
│  │ LLMService   │  │ Prisma ORM + db.ts      │  │ computed.ts         │ │
│  │ (OpenAI)     │  │ (singleton + retry)     │  │ (search, timeline)  │ │
│  └──────┬───────┘  └────────────┬────────────┘  └─────────────────────┘ │
└─────────┼───────────────────────┼────────────────────────────────────────┘
          │                       │
          ▼                       ▼
┌─────────────────┐     ┌─────────────────────────────────┐
│ OpenAI API      │     │ Database                         │
│ MyMemory (fallback)│  │ SQLite (local) / PostgreSQL (prod)│
└─────────────────┘     └─────────────────────────────────┘
```

### Layer responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Presentation** | React pages, tabbed live session, lecture viewer, dashboards |
| **Client state** | Zustand — auth, live segments, theme, learning level, course selection |
| **API** | Next.js Route Handlers — CRUD, AI proxying, error normalization |
| **Domain logic** | `computed.ts`, `terminology.ts`, `learning-level.ts` |
| **AI abstraction** | `LLMService` — single switch point for models |
| **Persistence** | Prisma → SQLite or PostgreSQL |

---

## 3. Technology Choices (Deep Dive)

For each technology: **what it is**, **why we use it**, **alternatives**, and **why we did not choose them**.

---

### 3.1 Next.js 16 (App Router)

**What:** Full-stack React framework with file-based routing, server components, and API routes.

**Why we use it:**
- Single repository for UI + backend — ideal for hackathon velocity
- Native Vercel deployment with zero extra configuration
- App Router supports layouts, loading states, and route groups for student/teacher portals
- API routes colocated with pages — no CORS issues between frontend and backend

**Alternatives considered:**

| Alternative | Why not chosen |
|-------------|----------------|
| **Create React App + Express** | Two deployments, CORS setup, more boilerplate; CRA is deprecated |
| **Remix** | Strong choice, but team familiarity and Vercel docs favor Next.js |
| **Vite + FastAPI (Python)** | Split stack; AI libs in Python are nice but frontend/backend type sharing is harder |
| **Angular / Vue** | Ecosystem fit with React libraries (Markmap, react-markdown) was already established |

**Evaluation talking point:** *"We chose Next.js because judges can run one `npm run dev` and see the full stack, and we deploy to Vercel in one click."*

---

### 3.2 React 19 + TypeScript

**What:** Component-based UI with static typing across the codebase.

**Why we use it:**
- TypeScript catches API contract mismatches between Prisma models and frontend interfaces
- React hooks model fits live session state (`useSpeechRecognition`, `useLiveTranslation`)
- Large ecosystem for markdown, math, and mindmap rendering

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **JavaScript only** | Faster initially but error-prone with 100+ files and API payloads |
| **SvelteKit** | Less library support for Markmap/KaTeX integration out of the box |
| **SolidJS** | Smaller community; fewer copy-paste solutions for education UI patterns |

---

### 3.3 Tailwind CSS 3

**What:** Utility-first CSS framework.

**Why we use it:**
- Rapid UI iteration for dashboards, tabs, and dark mode
- Design tokens via `bg-app`, `text-app-muted` custom theme in `tailwind.config.ts`
- No CSS module proliferation across 50+ components

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **CSS Modules** | More files; slower to prototype consistent spacing/colors |
| **Material UI / Chakra** | Heavier bundle; harder to achieve custom "IntelliShala" brand |
| **Styled Components** | Runtime cost; Tailwind is zero-runtime at build time |

---

### 3.4 Zustand 5

**What:** Minimal client-side state management library.

**Why we use it:**
- Live lecture session holds dozens of fields (segments, notes, mindmap, chat) — Zustand avoids prop drilling
- `persist` middleware for auth, theme, preferences, and selected course ID
- Simpler API than Redux for a project this size

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **Redux Toolkit** | Boilerplate (slices, actions) overkill for hackathon scope |
| **React Context alone** | Re-renders entire tree on every transcript segment update |
| **Jotai / Recoil** | Zustand's persist + devtools were sufficient and well-documented |
| **Server state (TanStack Query)** | Live session is mostly ephemeral client state until save |

**Where state lives:**

| Store | Persists? | Contents |
|-------|-----------|----------|
| `authStore` | Yes (localStorage) | Logged-in user |
| `lectureStore` | No | Live session segments, AI outputs |
| `themeStore` | Yes | Light/dark mode |
| `preferencesStore` | Yes | Learning level, selected course |

---

### 3.5 Prisma 5 + SQLite (dev) / PostgreSQL (prod)

**What:** Type-safe ORM with schema-first migrations.

**Why we use it:**
- **SQLite locally:** Zero Docker, zero cloud account — `npm run db:setup` works offline
- **PostgreSQL in production:** Relational integrity for enrollments, progress, quiz attempts
- Prisma generates TypeScript types from schema — autocomplete on `prisma.lecture.findMany`
- Same schema file; build script swaps provider for Vercel

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **Drizzle ORM** | Newer; Prisma seed CLI and docs are more hackathon-friendly |
| **Raw SQL / pg driver** | No type safety; verbose for 10+ models |
| **MongoDB / Firestore** | Lecture data is relational (Course → Lecture → Segments); joins are natural in SQL |
| **Supabase client only** | Would lock us to Supabase; Prisma works with any Postgres host |
| **MySQL** | PostgreSQL + Supabase free tier is standard for Vercel deployments |

**Dual-database strategy:**

```
Local:  DATABASE_URL=file:./dev.db     → provider = sqlite
Prod:   DATABASE_URL=postgres://...    → vercel-build swaps to postgresql
```

**Why not one DB everywhere?** SQLite removes friction for judges cloning the repo; Postgres handles concurrent serverless connections in production.

---

### 3.6 Supabase PostgreSQL + Connection Pooler

**What:** Hosted PostgreSQL with transaction pooler (port 6543) and session pooler (port 5432).

**Why we use it:**
- Free tier sufficient for demo/hackathon traffic
- Pooler required for **Vercel serverless** — each function invocation must not open unlimited direct connections
- `pgbouncer=true` fixes Prisma "prepared statement already exists" (error 42P05)

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **Neon** | Equally valid; Supabase UI familiar to team |
| **PlanetScale (MySQL)** | Prisma schema already relational; no need for Vitess-specific branching |
| **Vercel Postgres** | Vendor lock-in; Supabase pooler docs are well understood now |
| **Direct `db.*.supabase.co`** | Causes P1001 timeouts from Vercel — must use pooler host |

**Technical detail:** `src/lib/database-url.ts` auto-appends `pgbouncer=true`, `connection_limit=1`, and `sslmode=require` for pooler URLs. `src/lib/db.ts` uses a global singleton with retry on 42P05.

---

### 3.7 Web Speech API (Browser STT)

**What:** Chrome/Edge built-in speech recognition (`SpeechRecognition` / `webkitSpeechRecognition`).

**Why we use it:**
- **Zero API cost** for transcription during live lectures
- Low latency — interim results appear as the teacher speaks
- No audio upload to server — privacy-friendly for classroom use

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **OpenAI Whisper API** | Cost per minute; upload latency; needs server-side audio buffering |
| **Google Cloud Speech-to-Text** | Requires GCP billing, service account, streaming setup |
| **AssemblyAI / Deepgram** | Excellent accuracy but adds API key dependency for core demo flow |
| **Mozilla DeepSpeech (local)** | Heavy model download; worse UX in browser |

**Trade-offs we accept:**
- English input only (browser limitation)
- Requires Chrome or Edge
- Chrome sends audio to Google servers (network dependency) — documented in error messages

**Implementation notes (`useSpeechRecognition.ts`):**
- `continuous: true`, `interimResults: true`
- Auto-restart on `onend` to handle Chrome's session timeout
- Microphone warmup via `getUserMedia` before recognition starts

---

### 3.8 OpenAI API (GPT-4o / GPT-4o-mini)

**What:** Large language model for generation, translation, chat, and vision.

**Why we use it:**
- Single API for notes, mindmap markdown, exam questions, explain-back grading, chat, and board vision
- JSON-mode friendly responses for batched translation
- Vision endpoint for whiteboard photos

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **Anthropic Claude** | Would require second adapter; OpenAI vision + chat in one SDK |
| **Google Gemini** | Viable; team standardized on `openai` npm package |
| **Local LLM (Ollama, Llama)** | Cannot deploy on Vercel serverless; GPU not available |
| **Azure OpenAI** | Enterprise setup overhead for hackathon timeline |
| **Hugging Face Inference** | Cold starts and model selection complexity |

**Abstraction:** All calls go through `LLMService` in `src/lib/llm-service.ts`. Swapping provider means editing one file.

---

### 3.9 MyMemory Translation API (Fallback)

**What:** Free machine translation API (`api.mymemory.translated.net`).

**Why we use it:**
- Demo works **without** `OPENAI_API_KEY` for basic translation
- Judges can test Hindi/Bangla captions without billing setup

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **Google Translate API** | Paid; requires GCP |
| **LibreTranslate (self-hosted)** | Infrastructure burden |
| **No fallback** | Would break live demo when OpenAI key missing |

**Limitation:** MyMemory has rate limits and lower quality than LLM translation — acceptable for fallback tier.

---

### 3.10 Markmap (markmap-lib + markmap-view)

**What:** Client-side library that renders markdown headings as an interactive SVG mindmap.

**Why we use it:**
- Mindmap updates live as LLM produces markdown outline
- No server-side graph layout engine needed
- Pan/zoom built in

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **D3.js custom tree** | Weeks of layout code for hackathon |
| **Mermaid mindmap** | Less interactive pan/zoom |
| **Cytoscape.js** | Heavier; needs explicit node/edge JSON from LLM |
| **Static PNG from AI** | Not editable or zoomable |

**Bug fix:** `src/lib/markmap-render.ts` fixes SVGLength percentage error when container has no explicit pixel dimensions.

---

### 3.11 react-markdown + KaTeX (remark-math, rehype-katex)

**What:** Safe markdown rendering with LaTeX math support.

**Why we use it:**
- CS lectures include formulas (Big-O, equations)
- KaTeX renders faster than MathJax
- `rehype-katex` sanitizes math blocks in AI-generated notes

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **dangerouslySetInnerHTML** | XSS risk from LLM output |
| **MathJax** | Slower render; heavier bundle |
| **Plain text only** | Unacceptable for STEM lectures |

---

### 3.12 Tesseract.js (OCR fallback)

**What:** JavaScript port of Tesseract OCR running in Node/serverless.

**Why we use it:**
- Fallback when OpenAI Vision unavailable for board tab
- Extracts text from whiteboard photos client uploads

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **Google Vision OCR** | Extra API key and billing |
| **Azure Computer Vision** | Same |
| **Vision only (no OCR)** | Demo breaks without OpenAI key on board tab |

**Limitation:** Tesseract is slow on Vercel cold starts — vision API is the primary path in production.

---

### 3.13 Web Speech Synthesis (TTS)

**What:** Browser `speechSynthesis` API for read-aloud on transcripts and glossary.

**Why we use it:**
- No API cost
- Supports multiple voices per language (OS-dependent)
- Implemented in client-only `src/lib/tts.ts` with `"use client"`

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **ElevenLabs / Google TTS** | Paid; latency for every click |
| **OpenAI TTS** | Cost adds up for long transcripts |

---

### 3.14 Vercel (Hosting)

**What:** Serverless platform optimized for Next.js.

**Why we use it:**
- Git push → deploy in ~2–3 minutes
- Environment variables for `DATABASE_URL`, `OPENAI_API_KEY`
- Edge network for static assets

**Alternatives:**

| Alternative | Why not chosen |
|-------------|----------------|
| **AWS EC2 + PM2** | DevOps overhead; not hackathon-friendly |
| **Railway / Render** | Also valid; team used Vercel + Next.js docs path |
| **Docker on VPS** | Slower iteration; overkill for demo scale |

**Custom build:** `scripts/vercel-build.mjs` generates PostgreSQL Prisma client without running DB migrations during build (avoids 15+ minute hangs).

---

### 3.15 Other tooling

| Tool | Purpose | Alternative skipped |
|------|---------|---------------------|
| **tsx** | Run TypeScript seed script | `ts-node` — tsx is faster |
| **ESLint** | Lint | Biome — eslint-config-next is standard |
| **PostCSS + Autoprefixer** | CSS compat | Manual vendor prefixes |
| **localStorage** | Offline lecture backup | IndexedDB — overkill for JSON blobs |

---

## 4. Hybrid AI vs Code Design

This is a **key evaluation differentiator** — show judges you did not "LLM everything."

| Task | Implementation | If we used AI instead |
|------|----------------|----------------------|
| Transcript timestamps | Stored from Web Speech API events | LLM would invent fake times |
| "Important" flags during live | Regex on keywords (`exam`, `remember`) | Slow + expensive per segment |
| Timeline/chapters | Pause heuristic on `startMs`/`endMs` | LLM lacks audio clock |
| Search in lecture | `string.includes` over segments | Embeddings + vector DB = scope creep |
| Catch-up mode | Filter segments where `startMs > X` | Unnecessary LLM call |
| Join codes | Random alphanumeric generator | Wasteful and non-deterministic |
| Quiz score | `(score/total)*100` in SQL/JS | LLM bad at arithmetic |
| Readable IDs | `STU-2026-00001` counter in DB | — |
| Translation | LLM or MyMemory | Code cannot translate Hindi well |
| Notes/mindmap | LLM | Code cannot summarize prose |
| Explain-back grade | LLM compares student text to concepts | Requires semantic judgment |

**Phrase for judges:** *"We use AI only on the frontier of language understanding; everything with a deterministic answer stays in code."*

---

## 5. Data Model & Persistence

### Entity relationship (simplified)

```
User (teacher|student)
  ├── Course (teacherId) ── Lecture ── TranscriptSegment
  │                      └── ContentBlock (notes|mindmap|...)
  ├── Enrollment (student ↔ course)
  ├── LectureProgress (student ↔ lecture)
  ├── Bookmark
  └── QuizAttempt
```

### Design decisions

| Decision | Rationale |
|----------|-----------|
| **ContentBlock as typed rows** | One lecture has many AI outputs; `type` field avoids wide JSON blob |
| **status on ContentBlock** | Teacher workflow: AI Generated → Teacher Edited → Teacher Approved |
| **published on Lecture** | Server enforces students only fetch `published: true` |
| **Cascade delete on segments** | Deleting lecture cleans transcript children |
| **@@unique on Enrollment** | Prevents duplicate join for same student+course |
| **answers as JSON string in QuizAttempt** | Flexible question types without schema migration |

### Seed data

`prisma/seed.ts` creates:
- 1 teacher, 4 students
- 4 courses with join codes
- Multiple lectures with bilingual segments and content blocks
- Sample progress, bookmarks, quiz attempts

Production init: `/api/setup-database` or `npm run db:push:supabase`.

---

## 6. Key Application Flows

### 6.1 Student login → dashboard

```
POST /api/auth/login { username, password, role }
  → prisma.user.findFirst
  → ensureStudentEnrollments (if 0 enrollments, upsert all courses)
  → return { user: { id, readableId, ... } }

GET /api/courses/join?studentId=
  → enrollments with course + published lectures

GET /api/students/:id/dashboard
  → progress, quiz averages, bookmarks
```

### 6.2 Live session pipeline

```
1. User opens /session/live (must be authenticated)
2. useSpeechRecognition starts → interim/final segments → lectureStore
3. useLiveTranslation batches final segments every 400ms
4. POST /api/translate { texts, targetLanguage, learningLevel }
5. Updates segment.translatedText in store
6. Teacher tabs call respective APIs (notes, mindmap, etc.)
7. SaveLectureButton → POST /api/lectures (if course selected)
   + localStorage backup always
```

### 6.3 Lecture viewer (student)

```
GET /api/lectures/:id → segments + contentBlocks + course
LectureHydrator loads content into store for Explain/Chat tabs
TranscriptPanel: bilingual view, copy, TTS per segment
Progress/bookmarks/quiz → studentId-scoped API routes
```

---

## 7. Deployment & Infrastructure

### Environment matrix

| Variable | Local | Production |
|----------|-------|------------|
| `DATABASE_URL` | `file:./dev.db` | Pooler `:6543` + pgbouncer |
| `DIRECT_URL` | — | Session pooler `:5432` |
| `OPENAI_API_KEY` | Optional | Recommended |
| `SETUP_SECRET` | Default | Change in prod |

### Build pipeline

```
npm install
  → postinstall: prisma generate (skipped on Vercel)
vercel-build.mjs
  → swap schema to postgresql
  → normalize DATABASE_URL
  → prisma generate
  → next build
  → restore sqlite schema in git workspace
```

### Common production errors (know these for Q&A)

| Error | Cause | Fix |
|-------|-------|-----|
| P1001 Can't reach DB | Direct Supabase URL on Vercel | Use pooler host |
| 42P05 Prepared statement exists | Prisma + pooler without pgbouncer | `pgbouncer=true` in URL |
| P2021 Table does not exist | DB never seeded | Run setup URL |
| 0 courses after login | Stale demo session or missing enrollments | Log out; run setup; re-login |
| 503 on login | Tables missing | `/api/setup-database?secret=...` |

---

## 8. Security & Limitations (Honest Assessment)

**Be upfront with judges — this builds trust.**

| Area | Current state | Production would need |
|------|---------------|----------------------|
| Authentication | Plaintext password compare in DB | bcrypt/argon2 hashing |
| Session | Client-side Zustand + localStorage | HTTP-only JWT or session cookies |
| Authorization | Client sends `studentId` in API body | Server validates session owns that ID |
| Setup endpoint | Secret query param | Disable after init; strong random secret |
| LLM output | Rendered via react-markdown | Additional sanitization for untrusted models |
| Rate limiting | None | Per-IP limits on AI routes |
| CORS | Same-origin | N/A for current architecture |

**Why acceptable for hackathon:** Demo accounts are seeded; scope prioritized features over auth hardening.

---

## 9. Evaluation Q&A Bank

Organized by category. Prepare 2–3 sentence answers out loud.

---

### A. Product & Problem Statement

**Q: What problem does IntelliShala solve?**  
A: Students in multilingual classrooms often miss content when lectures are in English. IntelliShala provides live translated captions, structured notes, and revision tools so learners can follow in Hindi, Bangla, Tamil, and other languages while teachers keep teaching normally.

**Q: Who is the target user?**  
A: Two roles — **teachers** who record and curate AI content, and **students** who consume lectures, bookmark key moments, and self-test with quizzes.

**Q: How is this different from Otter.ai or Google Translate?**  
A: Otter focuses on transcription, not pedagogy. We combine live STT + translation with **course structure**, teacher approval workflow, mindmaps, glossaries, explain-back tutoring, and progress tracking — it's a classroom platform, not just a caption tool.

**Q: Why multilingual specifically?**  
A: Indian higher education often uses English instruction while students think in regional languages. Reducing that friction directly improves comprehension and exam outcomes.

---

### B. Architecture & System Design

**Q: Explain your overall architecture.**  
A: Next.js monolith — React frontend, API routes backend, Prisma ORM, PostgreSQL in production. Live STT runs in the browser; AI calls go server-side to protect API keys. Client state in Zustand until teacher saves to DB.

**Q: Why monolith instead of microservices?**  
A: Team size and hackathon timeline. Microservices would split auth, lecture, and AI services — adding deployment complexity without benefit at demo scale. Next.js API routes are microservice-ready if we extract later.

**Q: How do you separate concerns?**  
A: `LLMService` for AI, `computed.ts` for deterministic logic, `db.ts` for persistence, Zustand for ephemeral live state, Prisma schema for data model.

**Q: What happens if OpenAI is down?**  
A: Translation falls back to MyMemory; glossary has rule-based fallback; notes/chat/mindmap show errors. Live captions still work — STT is browser-based.

**Q: Why store transcripts as segments instead of one blob?**  
A: Enables per-segment translation, timestamps for catch-up/bookmarks, timeline UI, and incremental saves during long lectures.

---

### C. Frontend

**Q: Why Zustand over Redux?**  
A: Less boilerplate. Live session updates segments frequently — Zustand's selector pattern avoids full-tree re-renders without Redux middleware.

**Q: Why does live session require Chrome?**  
A: Web Speech API is the only zero-cost STT integrated in browser. Safari/Firefox lack equivalent continuous recognition.

**Q: How does dark mode work?**  
A: `themeStore` persists preference; inline script in layout prevents flash; Tailwind `dark:` variants.

**Q: How do you handle LLM markdown safely?**  
A: `react-markdown` does not execute HTML by default; math goes through KaTeX pipeline.

**Q: What is the learning level selector?**  
A: Beginner/Standard/Advanced adjusts prompt instructions sent to translate, notes, chat, glossary APIs — same lecture, different vocabulary complexity.

---

### D. Backend & Database

**Q: Why Prisma?**  
A: Type-safe queries, migration tooling, seed CLI, and dual SQLite/Postgres support for local vs production parity.

**Q: Why SQLite locally and Postgres in production?**  
A: SQLite = zero setup for judges cloning repo. Postgres = concurrent connections and Supabase hosting on Vercel serverless.

**Q: Explain the Supabase pooler issue.**  
A: Serverless functions open many short-lived connections. Transaction pooler (PgBouncer) multiplexes them. Prisma prepared statements conflict without `pgbouncer=true` — we normalize URLs in `database-url.ts`.

**Q: What is the singleton Prisma client?**  
A: `globalThis.prisma` reused across invocations in the same warm lambda. Prevents connection exhaustion and enables retry wrapper on pooler conflicts.

**Q: How are join codes generated?**  
A: Code-generated random strings (`generateJoinCode` in `terminology.ts`) with uniqueness check — not AI, because codes must be valid and unique.

**Q: How does teacher publish workflow work?**  
A: Lectures default `published: false`. Teacher reviews content blocks, sets status to Approved, PATCH sets `published: true`. Student API filters unpublished.

---

### E. AI / ML

**Q: Which features use AI vs code?**  
A: See [Section 4](#4-hybrid-ai-vs-code-design). Rule of thumb: if it needs language understanding → AI; if it needs math or timestamps → code.

**Q: How does live translation batching work?**  
A: `useLiveTranslation` waits 400ms, batches up to 5 final segments, POSTs to `/api/translate`, writes `translatedText` back. Reduces API calls vs per-word translation.

**Q: How do you preserve CS terminology in translation?**  
A: `terminology.ts` replaces terms like "binary search tree" with placeholders before translation, then restores — reduces garbage translations for technical terms.

**Q: How does explain-back work?**  
A: Student types explanation in their words → API sends transcript + their text to LLM → returns score and missing concepts.

**Q: Why GPT-4o for vision instead of OCR only?**  
A: Whiteboards have diagrams and layout; vision understands structure. OCR returns flat text without spatial context.

**Q: How would you reduce OpenAI costs?**  
A: Cache translations per segment hash, use mini model for simple tasks, batch larger groups, rate-limit chat tab, optional local STT for transcription only.

---

### F. Deployment & DevOps

**Q: How do you deploy?**  
A: Git push to GitHub → Vercel runs `vercel-build` → Prisma client for Postgres → Next.js build → serverless functions.

**Q: Why not run migrations during Vercel build?**  
A: We tried — Supabase connection timeouts caused 15–19 minute hangs. Schema push runs once locally or via setup URL.

**Q: What is `/api/setup-database`?**  
A: One-time bootstrap: runs SQL init if needed, seeds demo data, repairs missing enrollments. Protected by `SETUP_SECRET`.

**Q: How do you verify production health?**  
A: `GET /api/health` returns user/course/enrollment counts and pooler flag.

---

### G. Testing & Quality (if asked)

**Q: How did you test?**  
A: Manual E2E: login both roles, join course, open lecture, live session record, save lecture, verify dashboard stats. Local SQLite mirrors prod schema.

**Q: What would you add with more time?**  
A: Automated Playwright tests, bcrypt auth, JWT sessions, rate limiting, Whisper for non-English STT, vector search for cross-lecture Q&A.

---

### H. Tricky / Stress Questions

**Q: Your auth is insecure. Why should we trust the demo?**  
A: Correct — it's demo-grade by design for hackathon speed. We prioritized pedagogical features. Production roadmap: hashed passwords, server sessions, ID validation on every route.

**Q: Web Speech sends audio to Google. Is that privacy-safe?**  
A: For a classroom product, we'd disclose this and offer Whisper-on-prem or institutional STT as an enterprise option. For hackathon demo, zero-cost STT was the trade-off.

**Q: LLMs hallucinate notes. How do teachers trust output?**  
A: Teacher review workflow — content blocks have status fields; nothing is "Approved" until teacher edits. AI is draft, human is authority.

**Q: Why not fine-tune your own model?**  
A: Cost, data collection, and GPU ops exceed hackathon scope. RAG over saved lectures would be the next step before fine-tuning.

**Q: Scalability — 10,000 concurrent users?**  
A: Current bottlenecks: OpenAI rate limits, Supabase connection pool, serverless cold starts. Would add Redis cache, queue for AI jobs, dedicated API servers, CDN for static assets.

**Q: Single point of failure?**  
A: OpenAI API and Supabase. Mitigation: fallbacks (MyMemory), read replicas, multi-provider LLM adapter already partially abstracted in `LLMService`.

---

## 10. Demo Script for Judges

**Duration: ~5 minutes**

1. **Homepage** (30s) — Problem statement, multilingual value prop  
2. **Student login** `student/student123` (30s) — Show 4 courses, stats  
3. **Open a lecture** (60s) — Transcript bilingual view, TTS button, mindmap tab, quiz  
4. **Teacher login** `teacher/teacher123` (30s) — Roster, analytics from real DB  
5. **Live session** (90s) — Start mic, speak English, show Hindi translation live, open notes tab  
6. **Architecture** (60s) — Open README hybrid table or this doc Section 4  

**Backup if WiFi fails:** Local `npm run dev` with SQLite — fully functional offline except OpenAI calls.

---

## 11. Future Improvements

| Priority | Improvement |
|----------|-------------|
| High | JWT auth, password hashing, server-side session validation |
| High | Whisper API for multilingual STT input |
| Medium | Vector embeddings for "search all my courses" |
| Medium | WebSocket room for live student sync during class |
| Medium | Export PDF/PPT from notes |
| Low | Mobile PWA with native STT wrappers |
| Low | Institutional SSO (Google Workspace) |

---

## Quick Reference Card

```
Stack:     Next.js 16 · React 19 · TS · Tailwind · Prisma · Postgres · Zustand · OpenAI
Live STT:  Web Speech API (browser, free, English)
Live i18n: OpenAI translate → MyMemory fallback
AI layer:  LLMService → GPT-4o / mini
Deploy:    Vercel + Supabase pooler
Local:     npm install && npm run db:setup && npm run dev
Demo:      student/student123 · teacher/teacher123 · DSA26X
```

---

<p align="center"><sub>Document version 1.0 — IntelliShala Technical Documentation</sub></p>
