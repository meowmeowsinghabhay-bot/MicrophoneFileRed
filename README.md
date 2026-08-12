# Classroom Assistant

An AI-powered multilingual classroom assistant that turns live lectures into personalized, understandable learning material — in real time and after class. Students get live translated captions during the lecture, then structured notes, mindmaps, exam prep, and an interactive Q&A chatbot — all from a single lecture recording.

## Features

- **Live Transcription** — Real-time speech-to-text using the browser's Web Speech API
- **Live Translation** — Each transcribed segment translated into Hindi, Bangla, Arabic, or English
- **Board Capture** — Snap or upload board/slide images; AI extracts text, diagrams, and LaTeX formulas
- **Structured Class Notes** — Full transcript organized into headings, bullets, and preserved technical terms
- **Simplified Explanations** — Toggle "explain like I'm new" per section
- **Mindmap** — Auto-generated hierarchical topic diagram rendered with Markmap
- **Timeline** — Topic segments with approximate timestamps in a vertical timeline
- **Important Detection** — Live keyword spotting + post-class AI deep scan for exam-relevant content
- **Exam Questions** — AI-generated short-answer and long-answer practice questions
- **Revision Notes** — One-page compressed summary for quick pre-exam review
- **Explain-Back Mode** — Student explains a concept; AI scores correctness and gives specific feedback
- **Ask-AI Chatbot** — Free-form Q&A grounded only in this lecture's content

## Architecture

```
Mic ──► Web Speech API ──► live English transcript (client-side)
                              │
                              ├─► [live] chunk → LLM translate → live captions in target language
                              │
                              └─► [buffered] full transcript stored for after-class processing

Camera/upload ──► board/slide snapshot ──► LLM (vision) ──► text + LaTeX description, timestamped

After class, one combined pass over (full transcript + all snapshot descriptions):
  LLM ──► structured notes (target language)
  LLM ──► mindmap outline (markdown) ──► Markmap renders it
  LLM ──► timeline segments ──► timeline UI
  LLM ──► important-question flags (merged with live keyword-spotted flags)
  LLM ──► exam-style questions
  LLM ──► revision short notes

On demand:
  Student explanation + notes ──► LLM ──► evaluation + feedback
  Student question + transcript/notes ──► LLM ──► answer
```

## Technology Choices

| Need | Use | Why this, not the alternative |
|---|---|---|
| Live speech-to-text | **Web Speech API** (browser-native, Chrome/Edge) | Zero install, zero server cost, zero model to host. Alternative (Vosk-in-browser) needs a model download and WASM setup — more moving parts for the same live-captioning result, not worth it for a prototype where reliability matters more than offline capability. |
| Translation, notes, mindmap outline, timeline extraction, important-question flagging, exam questions, revision notes, explain-back grading, Q&A chat | **OpenAI API** (GPT-4o / GPT-4o-mini, one provider everywhere) | A single API key replaces a self-hosted vision-language model (e.g. Qwen2.5-VL via Ollama). Self-hosting needs a GPU or a Colab tunnel kept alive during judging — a real risk of breaking mid-demo. A hosted LLM API is one dependency, one key, no GPU, and just as capable for a single-lecture scope. |
| Board/diagram/formula reading | **Same LLM API's vision input** (send the snapshot image directly) | Avoids a separate OCR library (e.g. Tesseract) plus a separate vision model. One model call does OCR + diagram description + formula transcription together, so there's one prompt to tune instead of three pipelines to keep in sync. |
| Mindmap rendering | **Markmap** (renders a mindmap straight from a markdown outline, client-side, no backend) | The LLM already needs to output a markdown-style outline for the notes; feeding that same structure to Markmap means no extra "generate mindmap JSON" step and no diagramming library to wire up. |
| Timeline rendering | Plain HTML/CSS vertical timeline | A lecture has one linear timeline with maybe 5–10 segments — a styled div list is faster to build and just as clear as a charting library for this scale. |
| Lecture memory for Q&A / explain-back grading | **No vector database.** Pass the full transcript + notes directly in the LLM prompt each time. | A single lecture's transcript comfortably fits inside one LLM context window. A vector DB (ChromaDB) with embeddings and retrieval is solving a scale problem (many documents) that doesn't exist yet at "one lecture." Adding it is one more service to deploy and debug for zero benefit at this scope. |
| Text-to-speech | **Skipped** (not core to the problem) | Students are reading translated notes, not primarily listening. Browser TTS is free and can be added later if needed. |
| App structure | **One Next.js app** — React frontend + API routes as the backend | Removes the "separate frontend + separate backend + connect them" step entirely. API routes call the LLM API server-side (keeping the API key off the client). |
| Deployment | **Vercel** | Push to GitHub, import into Vercel, set one environment variable, deploy. No Docker, no GPU box, no server to keep alive during judging. |

## Deployment

### Prerequisites

- Node.js 18+ installed
- An [OpenAI API key](https://platform.openai.com/api-keys)
- **Chrome or Edge browser** (required for Web Speech API)

### Local Development

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd TeamRedSharksD3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your API key:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in **Chrome or Edge**.

5. **Test the core loop**
   - Click "Start Lecture"
   - Allow microphone access when prompted
   - Speak in English — you should see live transcription
   - Select a target language — translated captions appear below the English text

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. In the Vercel dashboard, go to **Settings → Environment Variables**
4. Add: `OPENAI_API_KEY` = your API key
5. Click **Deploy**
6. Open the deployed URL in **Chrome or Edge**

## Browser Requirements

**Use Chrome or Edge.** The Web Speech API (`SpeechRecognition`) is not supported in Firefox and has limited/unreliable support in Safari. If a judge opens the app in Safari and transcription doesn't work, that's a browser limitation — not a bug.

## Known Limitations

- **English input only** — Live transcription works best with English speech. The Web Speech API is configured for `en-US`.
- **Translation lag** — Live translation depends on API latency. If translation falls behind, English captions continue to display (graceful degradation).
- **Vision is on-demand** — Board snapshot analysis requires a manual capture or upload; it is not continuous video analysis.
- **Single-lecture scope** — No cross-lecture memory. Each session is independent; refreshing the page clears all data.
- **No offline mode** — Both transcription (browser API) and all AI features require an internet connection.
- **API costs** — Each LLM call (translation, notes, mindmap, etc.) uses the OpenAI API and incurs per-token costs.

## Project Structure

```
src/
├── app/
│   ├── api/          # Server-side API routes (LLM calls)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx      # Main app with tab navigation
├── components/
│   ├── tabs/         # One component per feature tab
│   ├── ControlPanel.tsx
│   ├── LanguageSelector.tsx
│   └── LiveCaptions.tsx
├── hooks/
│   ├── useSpeechRecognition.ts
│   └── useLiveTranslation.ts
├── lib/
│   ├── llm.ts        # OpenAI client wrapper
│   ├── constants.ts
│   └── types.ts
└── store/
    └── lectureStore.ts  # Zustand state management
```
