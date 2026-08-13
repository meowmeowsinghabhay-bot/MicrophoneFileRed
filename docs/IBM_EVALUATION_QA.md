# IntelliShala — IBM Software Engineer Evaluation Q&A

> Tough technical questions an IBM panel is likely to ask, with honest, implementation-grounded answers. Use this for demos, design reviews, and architecture discussions.

**Related:** [AI Features](./AI_FEATURES.md) · [Technical Documentation](./TECHNICAL_DOCUMENTATION.md) · [Live Demo](https://microphone-file-red-two.vercel.app)

---

## How to use this document

IBM engineers typically probe **trade-offs**, **failure modes**, **production readiness**, and **whether you understand your own boundaries**. Answers below:

- State what the system **does today**
- Acknowledge **gaps honestly**
- Describe the **production path** without hand-waving

**Start here for first-round panels:** [Round 1 — General & tricky questions](#round-1--general--tricky-questions) (Next.js vs React, PDF upload, ChatGPT, adoption, etc.)

---

## Round 1 — General & tricky questions

These are the questions evaluators often ask **before** deep architecture — product sense, motivation, and “gotcha” challenges. Answer calmly; many are designed to see if you confuse **live classroom capture** with **document upload**.

---

### Q. Why did you use Next.js instead of React?

**A:** Next.js **is** React — it is not an alternative to it. We use **React 19 for all UI** (components, hooks, Zustand). Next.js adds what a plain React SPA does not give us out of the box:

| Need | Next.js gives us | Plain React + Vite would need |
|------|------------------|-------------------------------|
| API routes (`/api/translate`, `/api/chat`, …) | Built-in Route Handlers | Separate Express/FastAPI backend |
| Deployment | One `git push` → Vercel serverless | Frontend + backend hosting separately |
| Routing | App Router file-based routes | React Router setup |
| Env secrets (`OPENAI_API_KEY`) | Server-only, never sent to browser | Same, but extra backend project |

**One-line answer for judges:** *“We didn’t choose Next.js over React — we chose Next.js **with** React because we need both a rich client (live session) and a secure server (AI keys, database) in one TypeScript codebase.”*

---

### Q. Why would professors upload their lecture PDF? / Why don’t you support PDF upload?

**A:** **We don’t ask professors to upload PDFs — and that’s intentional for our core use case.**

IntelliShala targets **live in-class teaching**: the professor speaks, writes on the board, and students need **real-time bilingual captions** and **session-derived** notes — not a static document summary.

| Input type | What it captures | Our support |
|------------|------------------|-------------|
| **Live speech** | What the teacher *actually said* today | Yes — Web Speech STT |
| **Board / slide photo** | Diagrams, formulas on the board | Yes — Board tab (camera/upload **image**) |
| **Pre-made PDF slides** | Static deck from before class | **Not in v1** — different product path |

**If they push “but professors already have PDFs”:**

> Many professors have slides, but slides alone miss explanations, asides, and board work. We capture the **spoken layer** that PDFs don’t contain. PDF upload is a valid **Phase 2** feature (parse PDF → merge with live transcript for richer notes), but it is not the primary problem we solved first.

**Honest gap:** We have image upload for boards, not PDF parsing. Adding PDF would mean `pdf.js` or a parser + chunking + RAG — on the roadmap, not the demo focus.

---

### Q. Why not just use ChatGPT?

**A:** ChatGPT is general-purpose. IntelliShala is **scoped to one lecture**:

- Answers tied to **your transcript and notes** (not the whole internet)
- **Live captions + translation** during class — ChatGPT doesn’t sit in a 60-minute live session
- **Teacher approval** before students see AI content
- **Course structure** — enrollments, progress, quizzes, bookmarks
- **Learning level** and **multilingual glossary** tuned for classrooms

ChatGPT is a tool students might misuse; IntelliShala is a **controlled classroom environment** built around the instructor’s session.

---

### Q. Why live recording? Why not upload a video or audio file after class?

**A:** Live first because:

1. **Students in the room** benefit from real-time translated captions *during* class.
2. **Lower friction** — teacher clicks Start; no file export/upload workflow.
3. **Privacy/cost** — we don’t store or stream raw audio to our server in v1.

Post-lecture upload (Zoom recording → Whisper) is a natural extension for absent students; live path was the differentiator for multilingual classrooms **in session**.

---

### Q. Professors already use PowerPoint / Google Slides. Why do they need your app?

**A:** Slides show **what** is on screen; they don’t:

- Translate the professor’s **oral explanation** into Hindi/Tamil/etc. live
- Flag “this might be on the exam” from **speech**
- Generate **explain-back** quizzes tied to what was said
- Give students a **single portal** for notes, mindmap, chat, and progress

We complement slides — Board tab even captures whiteboard content slides miss.

---

### Q. Isn’t this replacing teachers?

**A:** No. The workflow is **teacher-in-the-loop**:

- Teacher runs the session
- AI produces **drafts** (notes, quiz, glossary)
- Teacher **edits and approves** before publish
- AI chat is **grounded in that teacher’s lecture**, not a replacement lecturer

We automate **documentation and study aids**, not pedagogy or grading authority.

---

### Q. Why would a busy professor adopt this? Extra work?

**A:** **Upfront:** one click Start Lecture (same as starting any recorder).  
**After class:** one click **Generate All** → review once → publish.  

Compared to manually writing notes, making a mindmap, and drafting quiz questions, we **reduce** work. The review step is the cost — we argue one 10-minute review beats hours of prep. For multilingual classes, live translation alone saves repeated explanation in two languages.

---

### Q. How is this different from Google Meet / Zoom captions?

**A:**

| | Meet/Zoom captions | IntelliShala |
|--|-------------------|--------------|
| Scope | Captions in the call | Full **learning portal** after class |
| Languages | Limited live MT | 9 languages + glossary + notes in target language |
| Artifacts | None | Notes, mindmap, exam Qs, revision, explain-back |
| Grounded chat | No | Ask AI scoped to lecture |
| Course model | No | Enrollments, progress, teacher approval |

We’re not competing with video conferencing — we’re the **layer after capture** for structured learning.

---

### Q. Who is your target user?

**A:** Primary: **university/college instructors** teaching technical subjects to **multilingual student cohorts** (e.g. English-medium lecture, Hindi/Tamil-speaking students). Secondary: **students** reviewing published lectures, bookmarks, quizzes. Initial wedge: CS/engineering departments where terminology and formulas matter.

---

### Q. What exact problem are you solving?

**A:** In many classrooms, students **understand the language of instruction imperfectly**. They miss nuance, lose notes, and lack structured revision material. Teachers lack time to produce bilingual notes and assessments for every session. IntelliShala closes the gap: **capture once → bilingual access → structured study pack → teacher-approved publish.**

---

### Q. Why multilingual? Why not English only?

**A:** India (and many global campuses) have **English-medium instruction** with students more fluent in Hindi, Bangla, Tamil, etc. Legal/medical/technical terms stay in English; **explanations** in native language improve comprehension. That’s why we separate **Speak in** vs **Translate to** and built a bilingual glossary — not cosmetic i18n.

---

### Q. Is machine translation good enough for exams?

**A:** **Not as the sole source of truth.** We position translated captions and notes as **comprehension aids**. Exam-critical content goes through teacher review. We preserve CS terminology (`preserveTerminology`) to reduce garbage translations. For high-stakes assessment, the **teacher-approved English notes** remain authoritative; translation helps access, not replace curriculum.

---

### Q. What if the professor mumbles or the STT is wrong?

**A:** Web Speech is imperfect. Mitigations:

- Teacher can **edit transcript-derived notes** before publish
- **Board tab** captures written formulas separately
- Important keywords still work when speech is clear enough
- Production path: **Whisper / Watson STT** for better accuracy

We don’t claim courtroom-grade transcription — we claim **good enough for study aids** with human review.

---

### Q. What if the classroom has no internet?

**A:** Honest answer: **live translation and AI generation need network.** STT in Chrome also uses Google’s servers. Offline would require local STT/MT models — documented as future work. Local `npm run dev` + SQLite works offline for **portal UI**; AI features degrade without connectivity.

---

### Q. Why a web app? Why not mobile?

**A:** Live session needs **microphone + large screen** for tabs (notes, mindmap, chat) — laptop-first matches classroom reality. Web = no app store friction for demo. Mobile-responsive for **student review** on phone. Native app later for notifications and offline packs.

---

### Q. How would you monetize this?

**A:** Reasonable models (not implemented in demo):

- **Institution license** per department (SaaS)
- **Freemium** — live captions free; AI generation / analytics paid
- **Per-seat** for students in enrolled courses
- **Enterprise** — on-prem Watson/watsonx, SSO, compliance

Hackathon build focused on product proof, not billing.

---

### Q. Why OpenAI? Why depend on a paid API?

**A:** Best quality-to-integration speed for **vision + chat + generation** in one SDK. We mitigated dependency:

- **MyMemory** for free live translation
- **Tesseract** for OCR fallback
- **Code fallbacks** for glossary and keywords
- **`LLMService` abstraction** to swap watsonx or Azure OpenAI

Paid API is for **quality paths**; demo survives partially without key.

---

### Q. How is this different from Moodle / Canvas / Blackboard?

**A:** LMS platforms manage **courses, assignments, grades**. They don’t:

- Capture **live speech** and translate it
- Auto-generate mindmaps, explain-back, grounded chat from **today’s lecture**
- Run a **live AI session UI** during class

IntelliShala could **integrate as an LMS plugin** (LTI) — we’re the AI lecture layer, not a full LMS replacement.

---

### Q. Students already record lectures on their phones. Why your app?

**A:** Phone recordings give **audio files**, not:

- Searchable bilingual transcript
- Structured notes + mindmap
- Quiz and revision sheet
- Teacher-vetted content in the course portal
- Progress and bookmarks synced to **course ID**

We turn passive recordings into **interactive study material** tied to enrollment.

---

### Q. What’s your novelty? Otter.ai already transcribes.

**A:** Otter transcribes **meetings**. We built a **classroom loop**:

live STT → live MT → hybrid important detection → six AI artifacts → teacher approval → student portal with explain-back and scoped chat. **Multilingual + pedagogy + governance**, not transcription alone.

---

### Q. Why should IBM (or any enterprise) care?

**A:** Education is a regulated, multilingual, high-volume content domain. The architecture separates **client capture**, **AI proxy**, and **human approval** — pattern that maps to watsonx, Watson Speech, and institutional deployment. We built a vertical workflow, not a chatbot demo.

---

### Q. What did you deliberately not build? (scope trap question)

**A:** We did **not** build:

- PDF/slide deck ingestion (v1)
- Full LMS gradebook
- Proctored exams
- Native mobile apps
- Production auth (bcrypt/JWT) — demo debt
- Real-time student fan-out of live captions to 500 devices

Naming these shows we understand scope and aren’t overclaiming.

---

### Q. If a judge says “this already exists,” what do you say?

**A:** Parts exist in isolation (captions, notes AI, LMS). Our claim is **integration for multilingual live classrooms with teacher governance** in one product. Ask them to name one tool that does live bilingual captions **and** explain-back **and** course enrollment **and** approval workflow — usually they can’t. We’re the **assembly**, tuned for this user.

---

## 1. Architecture & system design

### Q1. Walk me through the end-to-end architecture in 60 seconds.

**A:** IntelliShala is a Next.js 16 monolith with three runtime layers:

1. **Browser** — Web Speech API for STT, Zustand for live session state, React tabs for UX. Audio never hits our server.
2. **Next.js API routes** — Auth, CRUD, and AI proxying (`/api/translate`, `/api/chat`, `/api/generate-notes`, etc.).
3. **External services** — OpenAI (GPT-4o-mini / GPT-4o vision), MyMemory (MT fallback), Supabase PostgreSQL (prod), SQLite (local).

Live flow: mic → transcript segments in `lectureStore` → batched translation → optional post-lecture AI generation → teacher review → publish to students via Prisma-backed lecture APIs.

We deliberately kept it a monolith: one deploy unit, one schema, one team — appropriate for demo scale; API routes can be extracted to services later.

---

### Q2. Why a monolith on Vercel serverless instead of microservices or Kubernetes?

**A:** **Scope and connection economics.** At hackathon scale, microservices would add:

- Separate deploy pipelines per service
- Inter-service auth and contract versioning
- Distributed tracing to debug one lecture session

Vercel serverless fits bursty classroom usage (lecture starts → spike → idle). The real bottlenecks are **OpenAI rate limits** and **DB pool size**, not Node process count.

**Production path:** Extract AI generation to a job queue worker (BullMQ / IBM Cloud Code Engine), keep CRUD on Next.js or move to a dedicated API behind an API gateway. We would not containerize first — we would **queue and cache** first.

---

### Q3. Where is the single point of failure?

**A:** Honestly, several:

| SPOF | Impact | Mitigation today | Production fix |
|------|--------|------------------|----------------|
| OpenAI API | Notes, chat, vision fail | MyMemory + OCR + code fallbacks for subset | Multi-model routing, cached outputs, queue + retry |
| Web Speech (Google) | STT fails offline / non-Chrome | Error message to user | On-prem Whisper / Watson Speech |
| Supabase pooler | DB routes fail | Prisma singleton + retry on `42P05` | Read replicas, connection budgeting |
| Client-side state | Refresh loses unsaved lecture | localStorage backup on save | Persist segments incrementally to server |

We do **not** claim five-nines availability. We **do** degrade gracefully: live captions can work when notes generation fails.

---

### Q4. How do you separate ephemeral live state from durable lecture data?

**A:**

- **Ephemeral:** `lectureStore` (Zustand) — segments, AI draft outputs, board captures during session. Lives in memory; lost on refresh unless saved.
- **Durable:** Prisma models — `Lecture`, `TranscriptSegment`, `ContentBlock`, `QuizAttempt`, `LectureProgress`.

`SaveLectureButton` calls `getLectureSnapshot()` → `snapshotToApiPayload()` → `POST /api/lectures`. Teachers also get localStorage backup via `lecture-persistence.ts`.

**Design choice:** We don't write every interim STT segment to Postgres during live class — that would hammer serverless DB connections. Batch save at end is the trade-off.

---

### Q5. If you had to split this into services tomorrow, what are the bounded contexts?

**A:**

1. **Identity & enrollment** — users, courses, join codes
2. **Lecture content** — transcripts, content blocks, publish workflow
3. **Realtime media** — STT/MT streaming (WebSocket or SSE)
4. **AI generation** — async jobs: notes, mindmap, exam, glossary
5. **Analytics** — teacher dashboard aggregates

Clear seams already exist at API route boundaries. `LLMService` in `src/lib/llm-service.ts` is the abstraction point for swapping providers.

---

## 2. AI / ML pipeline

### Q6. Why GPT-4o-mini instead of a larger model, or IBM watsonx?

**A:** **Cost × latency × task fit.**

- Live translation batching and notes generation are high-volume text tasks — mini is sufficient at low temperature (0.1).
- Vision board analysis uses **GPT-4o** because layout and formula understanding need multimodal capability.

**watsonx:** Valid enterprise alternative — we would wrap it behind `LLMService` with the same prompt contracts. We chose OpenAI for hackathon velocity (single SDK, vision + chat). For IBM deployment, watsonx Granite / Llama endpoints would replace `callLLM` with no UI changes.

---

### Q7. How do you prevent hallucination in Ask AI and notes?

**A:** Three layers:

1. **Prompt constraint** — Chat system prompt: answer ONLY from transcript + notes; say if not found.
2. **Human gate** — Teacher review workflow: content blocks stay `AI Generated` until edited/approved.
3. **Hybrid code** — Timestamps, keyword "important" flags, and join codes are code-generated, not LLM-generated.

We do **not** use RAG with citations yet — that's the next step: chunk segments, embed, retrieve top-k, cite `segmentId` in answers. That would materially improve auditability for enterprise.

---

### Q8. Explain your live translation batching algorithm. Why those constants?

**A:** From `useLiveTranslation.ts`:

| Constant | Value | Purpose |
|----------|-------|---------|
| `COALESCE_MS` | 120 | Wait briefly to merge back-to-back final segments |
| `FORCE_FLUSH_MS` | 450 | Cap wait during continuous speech — fixes stall bug |
| `FOLLOWUP_MS` | 40 | Drain backlog without hammering API |
| `MAX_BATCH_SIZE` | 8 | Balance payload size vs latency |

**Problem we solved:** Debouncing that reset on every new segment caused translation to **never flush** during continuous talking. Max-wait pattern ensures bounded latency.

**IBM follow-up:** In production we'd add adaptive batching based on p95 API latency and token limits, with metrics exported to Prometheus/Dynatrace.

---

### Q9. How do you preserve CS terminology across machine translation?

**A:** `preserveTerminology()` in `terminology.ts` post-processes MyMemory/GPT output against a curated map (e.g. "Binary Search Tree" → canonical form or known Hindi equivalent).

**Limitation:** Rule-based — new domain terms need dictionary updates. **Production path:** terminology store per course, teacher-editable glossaries synced before MT, or don’t-translate list injected into MT prompt.

---

### Q10. What's your strategy for prompt injection in the chat tab?

**A:** **Partially mitigated, not solved.**

Student question goes to GPT with transcript context. A student could write: "Ignore previous instructions…"

**Mitigations today:**
- System prompt scopes role as classroom assistant
- No tool/function calling — model can't execute code or query DB
- Transcript is server-side from client payload (trust boundary issue — see security)

**Production fixes:**
- Server loads transcript from DB by `lectureId`, not from client body
- Input sanitization + output moderation API
- Rate limits per student
- Log prompts/responses for audit

---

### Q11. Why Web Speech API instead of IBM Watson Speech to Text?

**A:** **Zero marginal cost and zero backend audio pipeline** for a hackathon demo.

| | Web Speech | Watson STT |
|--|------------|------------|
| Cost | Free (browser) | Per-minute billing |
| Latency | Low for English | Low with streaming API |
| Offline | No | Can be on-prem |
| Privacy | Audio to Google | Enterprise data residency options |
| Integration | Client-only | Requires streaming service + auth |

**Enterprise pitch:** Watson STT (or Whisper on IBM Cloud) would replace the client hook via a `SpeechToTextProvider` interface — we documented this path. Web Speech was the pragmatic demo trade-off.

---

### Q12. How would you evaluate translation and note quality quantitatively?

**A:** We don't have automated eval in-repo yet. Production approach:

- **Translation:** BLEU/chrF on held-out lecture pairs; human eval for technical terms; terminology violation rate.
- **Notes:** LLM-as-judge with rubric (coverage, fidelity, hallucination count); teacher edit distance before approval.
- **Explain-back:** Inter-rater agreement on sample explanations.

For IBM: integrate **watsonx.governance** or custom eval pipeline in CI when prompts change.

---

## 3. Security, privacy, compliance

### Q13. Your passwords are stored in plaintext. Defend this or fix it.

**A:** **We don't defend it — it's demo-grade debt.**

Login route compares `username`, `password`, `role` directly against Prisma:

```typescript
// src/app/api/auth/login/route.ts
where: { username, password, role }
```

**Fix (standard):** bcrypt/argon2 hash at registration, constant-time compare, password reset flow, no password in logs.

We prioritized pedagogical AI features over auth hardening for hackathon timeline. Any pilot with real students requires this as **P0**.

---

### Q14. How is the session authenticated on API routes?

**A:** **Weakly.** Client persists user object in Zustand + localStorage after login. API routes largely accept `studentId` / `teacherId` from request body without server-side session validation.

**Risk:** IDOR — caller could pass another user's UUID.

**Production fix:** HTTP-only JWT or session cookie, middleware validating token on every `/api/*` route, authorize `studentId === token.sub` or teacher owns course.

---

### Q15. Web Speech sends audio to Google. How do you handle FERPA / GDPR / enterprise data residency?

**A:** Today: **we don't** — suitable for demo, not for regulated deployment without disclosure and alternatives.

**Enterprise answer:**
- Document subprocessors in privacy policy
- Offer **on-prem or VPC-deployed STT** (Watson, Whisper) where audio never leaves institution network
- Minimize retention — we don't store raw audio, only text transcripts
- Data Processing Agreement with cloud providers
- Student consent for recording in live sessions

IBM angle: **Watson Speech + watsonx in customer VPC** is the compliance story we would sell to schools.

---

### Q16. Where are API keys stored? Who can hit your AI routes?

**A:** `OPENAI_API_KEY` in Vercel environment variables — server-side only, never exposed to client.

**Gap:** AI routes are not authenticated — anyone who discovers `/api/chat` can burn credits.

**Fix:** Auth middleware, per-user quotas, API key rotation, WAF rate limiting on Vercel/Cloudflare.

---

### Q17. How do you handle PII in transcripts sent to OpenAI?

**A:** Transcripts may contain names, IDs spoken aloud. We send full transcript to OpenAI for notes/chat with **no redaction layer**.

**Production:** PII detection pass (email, phone, SSN patterns), opt-in for AI processing, OpenAI enterprise zero-retention agreement, or self-hosted model for sensitive deployments.

---

## 4. Database, reliability, operations

### Q18. Explain the Supabase PgBouncer / Prisma prepared statement issue you hit.

**A:** Serverless functions open many short-lived DB connections. Supabase transaction pooler (port 6543) multiplexes them. Prisma's prepared statements conflict with PgBouncer in transaction mode → PostgreSQL error `42P05`.

**Fix in `database-url.ts`:**
- Append `pgbouncer=true` and `connection_limit=1` to pooled URL
- Singleton Prisma client on `globalThis` with retry wrapper
- `DIRECT_URL` on port 5432 for DDL/migrations only

This is a **well-known serverless + Prisma pattern** — we'd document it in runbooks for any ops team.

---

### Q19. Why don't you run migrations during Vercel build?

**A:** We tried — Supabase connection from build environment caused **15–19 minute hangs** or timeouts.

**Current approach:** `vercel-build.mjs` generates Postgres Prisma client without DB push; schema applied via local `db:push:supabase` or one-time `/api/setup-database?secret=...`.

**Production:** Migrations in CI/CD (GitHub Actions) against direct URL before deploy — never from serverless build step.

---

### Q20. How would you make lecture save idempotent?

**A:** Today `POST /api/lectures` creates new rows — duplicate clicks could duplicate lectures.

**Production:**
- Client generates `idempotency-key` header (lecture session UUID)
- Unique constraint on `(courseId, clientSessionId)`
- Upsert segments by `orderIndex`
- Return 200 with same resource on retry

Critical for unreliable mobile networks in classrooms.

---

### Q21. What observability do you have?

**A:** **Minimal** — `console.error` in API routes, `/api/health` for DB counts.

**Production stack we'd add:**
- Structured JSON logging (pino)
- Trace IDs across client → API → OpenAI
- Metrics: translation p95, OpenAI error rate, DB pool wait time
- Alerting on 503 spike on `/api/translate`

IBM: integrate **Instana** or **Log Analysis** on Cloud.

---

## 5. Scalability & performance

### Q22. Can this handle 500 students in one live lecture?

**A:** **Not in current architecture.**

- STT runs on **teacher's browser only** — one stream. Students would read published content after class, not live STT fan-out.
- If 500 students each hit Ask AI simultaneously → OpenAI rate limits and serverless cold starts hurt.

**Scale-out design:**
- Live session: WebSocket fan-out from teacher's published caption stream (Redis pub/sub or Ably)
- AI generation: async job queue, not synchronous HTTP
- Read-heavy lecture pages: CDN + edge cache for published content
- Chat: per-lecture rate limit, cached answers for common questions

---

### Q23. What's your OpenAI cost model for a 60-minute lecture?

**A:** Rough order of magnitude (varies by speech density):

| Action | Calls | Est. tokens |
|--------|-------|-------------|
| Live translation (MyMemory primary) | ~50–100 batches | $0 if MyMemory |
| Generate All | 6 parallel calls | ~15k–40k tokens |
| Chat (per question) | 1 each | ~2k–5k tokens |

**Generate All** is the expensive spike — one-shot ~$0.01–0.05 on mini at typical transcript lengths.

**Optimization:** Cache segment translations by hash, skip GPT translate when MyMemory succeeds, defer non-critical generation to background jobs.

---

### Q24. Why store transcript as segments instead of one TEXT column?

**A:**

1. Per-segment translation state (`translatedText`)
2. Timestamp-indexed UI (timeline, catch-up, bookmarks reference `startMs`)
3. Incremental merge of interim/final STT by `resultIndex`
4. Important flags per segment
5. Future: partial re-generation without reprocessing entire lecture

Normalized `TranscriptSegment` table maps directly to live session model.

---

## 6. Frontend & UX engineering

### Q25. Why Zustand instead of Redux or React Context?

**A:** Live session updates segments at high frequency. Zustand gives:

- Selector-based subscriptions → fewer re-renders than Context
- Less boilerplate than Redux for hackathon speed
- `persist` middleware for auth/preferences where needed

We don't need time-travel debugging for demo — we need **simple, fast state updates**.

---

### Q26. How do you prevent XSS from LLM-generated markdown?

**A:** `react-markdown` with default settings **does not render raw HTML** from markdown. Math goes through KaTeX (`remark-math`, `rehype-katex`) — trusted pipeline.

We don't use `dangerouslySetInnerHTML` for LLM output.

**Still review:** markdown link injection, `javascript:` URLs — enable `rehype-sanitize` for production.

---

### Q27. What happens if the teacher refreshes mid-lecture?

**A:** **Unsaved work is lost** unless they had clicked save (which requires stopped recording for DB path).

Mitigation today: localStorage on explicit save.

**Better:** `beforeunload` warning + periodic autosave of segments to IndexedDB or draft API endpoint every N seconds.

---

## 7. Product differentiation & IBM relevance

### Q28. Why would IBM care about this vs building on watsonx alone?

**A:** IntelliShala is a **vertical workflow**, not a model demo:

- Teacher approval gate (governance)
- Multilingual classroom UX (STT + MT + glossary + TTS)
- Active learning (Explain Back) — not just summarization
- Course/enrollment/ progress model — LMS-lite integration point

**IBM fit:** Replace OpenAI with **watsonx.ai**, STT with **Watson Speech**, deploy on **IBM Cloud** or **Cloud Pak for Data**, add **watsonx.governance** for model monitoring. The architecture was designed with `LLMService` abstraction for exactly this swap.

---

### Q29. What's genuinely novel here?

**A:** Not STT alone — Otter does that. The combination:

1. **Hybrid code + AI** — keyword important detection (free, instant) + optional LLM deep scan
2. **Live MT + terminology preservation** for CS lectures in Indic languages
3. **Explain Back** — formative assessment loop tied to transcript
4. **Teacher-in-the-loop publish** — AI draft → human approve → student sees
5. **Full session → six artifacts** in one Generate All pipeline

Novelty is **workflow integration for multilingual classrooms**, not a single model call.

---

### Q30. What would you ship in a 90-day IBM pilot with a university?

**A:** Phased:

| Phase | Deliverable |
|-------|-------------|
| 0–30d | bcrypt + JWT auth, API auth middleware, audit logging |
| 30–60d | Watson STT streaming, watsonx for notes/chat, PII redaction |
| 60–90d | Admin dashboard, SSO (SAML), FERPA docs, load test 200 concurrent readers |

Keep Web Speech as **optional fallback** for BYOD laptops without VPN to Watson endpoint.

---

## 8. Testing & quality

### Q31. What's your test strategy?

**A:** Honest answer: **manual E2E** for demo — login both roles, join course, record, generate, save, verify dashboard.

**Would add:**
- **Unit:** `addSegment` merge logic, `preserveTerminology`, batching scheduler
- **Integration:** API routes with mocked OpenAI (MSW / vitest)
- **E2E:** Playwright — critical path in CI
- **Contract tests:** JSON shape from `/api/translate`, `/api/explain-back`

No automated tests in repo today — known gap.

---

### Q32. How do you test AI outputs that are non-deterministic?

**A:**

- **Schema validation** — parse JSON, assert array lengths match input
- **Property checks** — translated lines non-empty; score 0–100; no echo of system prompt
- **Snapshot with tolerance** — not exact string match
- **Golden set** — 5 fixture transcripts; regression when prompt changes
- **Human eval** — teacher review workflow is the ultimate QA gate

---

## 9. Rapid-fire round (short answers)

| Question | Answer |
|----------|--------|
| **Primary database locally?** | SQLite via Prisma — zero Docker |
| **Production database?** | Supabase PostgreSQL behind PgBouncer |
| **Auth mechanism?** | Demo: plaintext + client persisted user object |
| **STT provider?** | Web Speech API (browser) |
| **MT fast path?** | MyMemory |
| **MT quality path?** | GPT-4o-mini |
| **Vision model?** | GPT-4o |
| **OCR fallback?** | Tesseract.js |
| **State management?** | Zustand |
| **Deployment?** | Vercel serverless |
| **Languages supported?** | 9 (en, hi, bn, ar, ta, te, mr, es, fr) |
| **Learning levels?** | beginner / standard / advanced — prompt tuning |
| **Published content gate?** | Teacher approval on content blocks |
| **Health check?** | `GET /api/health` |
| **Biggest technical debt?** | Auth + API authorization |
| **Biggest scaling bottleneck?** | OpenAI rate limits + unauthenticated AI routes |

---

## 10. Closing statement (30 seconds)

> IntelliShala is a multilingual classroom workflow engine, not a wrapper around one API. We use code where determinism matters — timestamps, keywords, terminology — and LLMs where language understanding matters — notes, chat, vision. We know the auth and compliance gaps and designed abstraction points (`LLMService`, STT provider, content approval) so enterprise components like watsonx and Watson Speech slot in without rewriting the product. The demo proves the pedagogical loop; the architecture document proves we know what production requires.

---

*Prepared for IBM software engineering evaluation — August 2026.*
