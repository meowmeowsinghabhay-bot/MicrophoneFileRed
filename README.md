# IntelliShala

IntelliShala turns live classroom lectures into personalized, multilingual learning material — with a full **teacher portal**, **student portal**, and a **hybrid architecture** where code handles deterministic work and AI handles understanding.

> **Live transcription + translation is preserved as-is.** The Web Speech API pipeline and translation hook logic were not refactored — only restyled to match the design system.

## Quick Start

```bash
npm install
npm run db:setup      # creates SQLite DB + seeds demo data
npm run dev
```

Open **http://localhost:3000** in **Chrome or Edge**.

### Demo Logins

| Role | Username | Password | ID |
|------|----------|----------|-----|
| Student | `student` | `student123` | STU-2026-00001 |
| Teacher | `teacher` | `teacher123` | TCH-2026-00001 |

**Demo join code:** `DSA26X`

## Portals

| Route | Who | What |
|-------|-----|------|
| `/` | Everyone | Homepage |
| `/login/student` | Student | Sign in |
| `/login/teacher` | Teacher | Sign in |
| `/student/dashboard` | Student | Courses, join code, continue learning |
| `/teacher/dashboard` | Teacher | Analytics, roster, create courses |
| `/session/live` | Both | **Live session** (transcription + translation + AI tabs) |
| `/lecture/[id]` | Student | Lecture viewer (transcript, notes, mindmap, catch-up) |
| `/teacher/lectures/[id]/review` | Teacher | Edit/approve AI content |

## Teacher Role

Teachers can:
- Create courses with **code-generated join codes** (not AI)
- Record live lectures via `/session/live`
- Review AI notes/mindmap/revision with status: `AI Generated` → `Teacher Edited` → `Teacher Approved`
- Publish/unpublish lectures (enforced server-side — students only see `published: true`)
- View student roster with real quiz scores and completion counts
- See analytics computed from DB (not fabricated)

## AI vs. Code (Hybrid Architecture)

| Feature | Method | Why |
|---------|--------|-----|
| Live transcription | **Code** — Web Speech API | Browser-native, zero cost |
| Live important detection | **Code** — keyword/regex on segments | Instant, zero API cost |
| Timeline segments | **Code** — pause heuristic on timestamps | LLM doesn't have real timestamps |
| Search in lecture | **Code** — string match / FTS-style | Single lecture, no embeddings needed |
| Bookmarks, progress, quiz scoring | **Code** — DB reads/writes | Pure arithmetic |
| Join codes, readable IDs | **Code** — random/counter generation | Deterministic, free |
| Catch-up / what did I miss | **Code** — timestamp filter | No AI needed to know "after minute 18" |
| Terminology preservation | **Code** — lookup table | Reliable vs. prompt-only |
| Live translation | **AI** — LLM (+ free MyMemory fallback) | Requires language understanding |
| Structured notes | **AI** — LLM | Generation task |
| Mindmap outline | **AI** — LLM | Topic hierarchy inference |
| Board/diagram reading | **AI** — vision (+ OCR fallback) | Requires vision |
| Exam questions, revision | **AI** — LLM | Creative generation |
| Explain-back evaluation | **AI** — LLM | Compare student explanation |
| Ask-the-lecture chat | **AI** — LLM | Grounded Q&A |
| Important deep scan (optional) | **AI** — LLM secondary pass | Catches what keywords missed |

All AI calls route through **`src/lib/llm-service.ts`** (`LLMService` class). Switch provider/model in one file.

## Live Pipeline (Untouched Logic)

These files are **black boxes** — do not refactor internal logic:

- `src/hooks/useSpeechRecognition.ts` — Web Speech API, restart-on-end, mic warmup
- `src/hooks/useLiveTranslation.ts` — batched segment → `/api/translate` flow
- `src/app/api/translate/route.ts` — translation API

Only `src/components/LiveCaptions.tsx` styling was updated.

## Technology

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16, React, TypeScript, Tailwind |
| Backend | Next.js API routes |
| Database | SQLite (dev) / PostgreSQL (prod via `DATABASE_URL`) |
| ORM | Prisma 5 |
| Live STT | Web Speech API (Chrome/Edge) |
| AI | OpenAI GPT-4o / GPT-4o-mini via `LLMService` |
| Mindmap | Markmap (client-side) |
| OCR fallback | Tesseract.js |
| Translation fallback | MyMemory free API |

## Deployment

1. Clone repo, `npm install`
2. Set environment variables:
   ```
   DATABASE_URL="file:./dev.db"          # or postgresql://... for production
   OPENAI_API_KEY=sk-...                 # optional — fallbacks work without it
   ```
3. `npm run db:setup`
4. `npm run build && npm start`
5. Deploy to **Vercel** — add env vars, use **Supabase/Neon/Railway** for managed Postgres in production

For PostgreSQL production, change `provider` in `prisma/schema.prisma` to `postgresql` and run `npx prisma db push`.

## Known Limitations

- Live transcription: English input, Chrome/Edge only
- OpenAI credits required for full AI features; translation/board have free fallbacks
- Quiz/explain-back in lecture viewer require live session data in store
- Demo mode uses seeded SQLite data — no API keys needed to explore UI

## Project Structure

```
src/
├── app/
│   ├── api/              # REST API routes
│   ├── student/          # Student portal
│   ├── teacher/          # Teacher portal
│   ├── session/live/     # Live recording session
│   └── lecture/[id]/     # Lecture viewer
├── hooks/
│   ├── useSpeechRecognition.ts  # ⚠️ DO NOT MODIFY LOGIC
│   └── useLiveTranslation.ts    # ⚠️ DO NOT MODIFY LOGIC
├── lib/
│   ├── llm-service.ts    # Single AI abstraction
│   ├── computed.ts       # Code-computed features
│   ├── terminology.ts    # Term preservation table
│   └── db.ts             # Prisma client
└── components/
    └── LiveCaptions.tsx  # Styled shell only
```
