# ReMind: Technical Plan + M0 / M1 Execution Plan

> Status: **draft, needs both of us to confirm** (open questions in §9)
> Written: 2026-10-22
> Based on: the repo (plan v1, CLAUDE.md, 2026-10-20 kickoff notes, PR #2) and our follow-up discussions

---

## 0. Where we are

| Item | Status |
|---|---|
| Repo skeleton (monorepo, a README per folder) | ✅ Done |
| `CLAUDE.md` team rules | ✅ Done (stack table still TBD; rule 1 still to update) |
| Kickoff meeting notes (10/20) | ✅ Merged |
| PR #2: add "how we get saved videos" to the meeting notes | ⏳ Waiting for review |
| Code | ❌ None yet |
| Work split | Vertical, by feature; milestones M0–M6; who is A / B not decided yet |

---

## 1. How we get the user's saved videos

**Bottom line:** neither TikTok nor IG has an API for a user's saves, so we have two paths that feed the same pipeline:

```text
 ① Paste a link (real time, one save at a time)    ┐
                                                    ├─→ video URLs → pipeline → Nuggets → Agent
 ② Upload the official data export (many at once)  ┘
```

| Path | User does | Backend does | When |
|---|---|---|---|
| **① Paste a link** | In the app, Share → Copy link, then paste into ReMind | yt-dlp fetches metadata and downloads the video → pipeline | **M2** |
| ① Upgrade | Pick ReMind straight from the system Share sheet (iOS Shortcut / Telegram bot) | Same as a pasted link | M5 or later |
| **② Upload the export** | "Download your data" in TikTok / IG settings, choose JSON, upload the zip | Parse saved links + timestamps → send each through the pipeline | **M5** |

**Limits:**
- **Public videos only.** IG sometimes requires login to download, so **test this first thing in M2**.
- The export has **links and timestamps only, no videos**, and **we haven't confirmed it includes the saved list**. Each of us should request our own export and check.

**Out of scope:** official APIs (no access to saves), logging in with the user's account to scrape, browser extensions that scrape (against platform terms, risk of account bans).

**During development:** collect ~20 public video links by hand as test data. We don't need either path working yet.

---

## 2. How we turn a video into Nuggets

### 2.1 Two approaches

**Approach A: pipeline (primary)**

```text
Video URL
  ├─ ① Metadata (yt-dlp): title, description, hashtags, author, duration     ← free
  ├─ ② Subtitles: use the video's own subtitles if it has them              ← free
  ├─ ③ ASR: if no subtitles, faster-whisper speech to text (with timestamps) ← local, free
  └─ ④ Key frames: ffmpeg grabs 3–5 frames at scene changes
                   → a VLM reads the scene and on-screen text                ← cheap
                    ↓
        An LLM turns ①–④ into timestamped Nuggets
```

**Approach B: one multimodal model reads the whole video (for comparison)**

```text
Video file (picture + sound) → a video-capable multimodal model (e.g. Gemini, callable via OpenRouter) → Nuggets
```

### 2.2 Comparison

| | A: pipeline | B: one model |
|---|---|---|
| Code | More | Less |
| Understanding | Parts are read separately, may miss "pointing while talking" links | Better holistic understanding |
| Cost | **Cheap** (ASR runs locally for free, VLM sees only a few frames) | Video uses many tokens, expensive |
| Debugging | **Every step has an intermediate result** | Black box |
| Timestamps | **Precise** (ASR provides them) | Sometimes off |
| Swapping models | Each part can be swapped on its own | Tied to a few models |

**Decision: A is the primary approach. In M2 we also build B and compare them on the same 20 videos** (accuracy, timestamps, cost, latency).

### 2.3 Open-source projects to learn from (Approach A has been done before)

| Project | What it does | Why it helps us |
|---|---|---|
| [**SousVid**](https://github.com/leshicodes/SousVid) (MIT) | TikTok / Reels / Shorts URL → yt-dlp download → ffmpeg frames → faster-whisper (CPU) transcript → multimodal model via **OpenRouter** → structured recipe | **Almost exactly our Approach A**, with the same stack. We can follow its structure and swap "recipe" for our Nuggets |
| [claude-real-video](https://www.everydev.ai/tools/claude-real-video/llms.txt) | yt-dlp for TikTok; **uses existing subtitles and only runs Whisper when there are none**; ffmpeg keyframes at **scene changes** with dedup | Its "skip work when you can" layering and frame extraction |

> ⚠️ We haven't confirmed these projects are still maintained. Check the repos before relying on them, and follow their licenses if we reuse code.

### 2.4 Key design: fixed interface, swappable implementation

```python
def understand(video_url: str) -> list[Nugget]:
    ...
```

Intent inference, goals, and everything downstream call only this function. They don't care whether A or B is inside.

**What Nuggets look like:**

```json
[
  {"t": "0:05", "text": "Ichiran Ramen Shibuya, open 24 hours"},
  {"t": "0:18", "text": "Go before 11 AM and there's almost no line"},
  {"t": "0:31", "text": "Order spice level 5 + soft-boiled egg"}
]
```

---

## 3. Tech stack

### 3.1 Decided

| Item | Choice |
|---|---|
| Environment | **Docker** (from M0 on) |
| Frontend | **React** |
| Model calls | **OpenRouter** |

### 3.2 Proposed (both of us need to confirm)

| Item | Proposal | Why |
|---|---|---|
| Backend language | **Python** (version TBD, 3.12 suggested) | Best AI library ecosystem |
| Backend framework | **FastAPI** | Simple; auto-generates API docs |
| Python dependencies | **uv** | Fast, and the lockfile keeps our environments identical |
| Frontend tooling | **Vite + React + TypeScript** | The most common React starter; TypeScript keeps frontend and backend data shapes in sync |
| UI components | **Tailwind CSS + shadcn/ui** | No building components from scratch, and it looks good |
| Database | **SQLite + SQLModel** | Define each data shape once and use it for both storage and the API; can move to Postgres later |
| Agent framework | **None at first.** Write the agent loop ourselves with the OpenAI SDK | The goal is to learn how it works; use the official MCP SDK in M4 |
| Formatting | **ruff** for Python; **Prettier + ESLint** for the frontend | Keeps PRs free of unrelated formatting changes |
| Login | **None.** A persona switcher in the UI | Not needed for the demo |

### 3.3 Decide later

| Item | When |
|---|---|
| Which model the agent uses | M1: evaluate 2–3 models, then pick |
| Approach A or B for Nuggets | M2: after the comparison |
| Vector database | M5: when importing many past saves |
| Logging tool (JSON file vs. Langfuse, etc.) | Start with a JSON file |
| Deployment | After the demo is done |

---

## 4. How we call models

### 4.1 OpenRouter as the single entry point

- **One key, hundreds of models** (DeepSeek, Qwen, gpt-oss, Gemini, …), with an OpenAI-compatible API.
- **Switching models means changing the model name.** No code changes.
- Some models accept **video and audio input directly** (usable for Approach B). Filter by input type on OpenRouter's Models page to see which.

### 4.2 Config (`.env`, never committed)

```text
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=your_key
LLM_MODEL=model_name
```

> `.env.example` still says `NEBIUS_API_KEY`. In M0 we replace it with these three generic names. Moving to Nebius, Groq, DeepSeek, or a local Ollama later only means changing these three lines.

### 4.3 One shared helper: `backend/tools/llm.py`

- Every module calls models through it. No one writes their own client.
- **Every call is logged** to `logs/llm_calls.jsonl`: model, input, output, latency, and which feature made the call (tag).
- Asks the model for JSON and retries once if parsing fails.

### 4.4 What we use for each job

| Job | What | Cost |
|---|---|---|
| Agent brain (intent, decisions, …) | A cheap text model on OpenRouter | ~$0.002 per save |
| ASR | **faster-whisper**, running locally in Docker | Free |
| VLM (reading key frames) | A cheap vision model on OpenRouter | Very little |
| Approach B (reading whole videos) | A video-capable model on OpenRouter | Depends on model and resolution; can be tens of times more |

**Estimate:** about **$5–20** for the whole project.

### 4.5 Rules

1. **Each of us has our own OpenRouter key** with a **spending cap** set on the platform (e.g. $10).
2. **The repo is public.** Keys go only in `.env`. If one is ever committed, **revoke it on the platform right away**. Deleting the commit isn't enough, because it stays in git history.

---

## 5. How we use Docker

### 5.1 Why Docker

The project needs Python, libraries, ffmpeg, yt-dlp, faster-whisper, Node.js… On two different machines, it's easy to end up with "works for me, breaks for you." Docker packages **the OS, dependencies, and code into containers** that run the same on any machine.

### 5.2 Our containers

```text
docker-compose.yml
├── api   ← FastAPI backend (Python + ffmpeg + yt-dlp + faster-whisper), port 8000
└── web   ← React dev server (Vite), port 5173
(SQLite is just a file, so no separate database container)
```

**Sketch** (we write the real one in M0):

```yaml
services:
  api:
    build: ./backend
    ports: ["8000:8000"]
    env_file: .env                    # pass the API keys into the container
    volumes:                          # edit locally, takes effect in the container
      - ./backend:/app/backend
      - ./data:/app/data
      - ./logs:/app/logs
    command: uvicorn backend.api.main:app --host 0.0.0.0 --reload
  web:
    build: ./frontend
    ports: ["5173:5173"]
    volumes:
      - ./frontend:/app
      - /app/node_modules             # keep node_modules in the container (faster on Windows)
    command: npm run dev -- --host
```

### 5.3 Common commands

| Command | What it does |
|---|---|
| `docker compose up` | Start the whole project (builds on first run) |
| `docker compose up --build` | Rebuild after changing a Dockerfile or dependencies, then start |
| `docker compose down` | Stop |
| `docker compose logs -f api` | Follow backend logs |
| `docker compose exec api bash` | Open a shell inside the backend container |

Once running:
- `http://localhost:5173`: the frontend
- `http://localhost:8000/docs`: backend API docs (auto-generated by FastAPI)

### 5.4 Windows notes

- **Open Docker Desktop first** and wait for "Engine running."
- Docker Desktop needs WSL 2. Each of us should check our own machine.
- Code is synced into the containers through volumes, so saved edits take effect without rebuilding.

---

## 6. M0: Foundations

### 6.1 What we need to agree on first

- [ ] The stack in §3.2 (including the Python version)
- [ ] Who is A and who is B
- [ ] Data shapes: Save / Nugget / Intent / Profile (per plan §8.4)
- [ ] The endpoint list (§6.4)
- [ ] File naming and placement rules (§8)
- [ ] Each of us registers on OpenRouter and sets a spending cap

### 6.2 Steps

**Step 1: Tools (each of us, ~30 min)**
- Open Docker Desktop and make sure it runs.
- Register on OpenRouter, create a key, set a spending cap, add a little credit.
- Copy `.env.example` to `.env` and fill it in.

**Step 2: Build the skeleton together (pair programming, 1–2 evenings)**
- One person types, the other watches, suggests, and looks things up. **Swap every 30–60 minutes.**
- Covers:
  - `backend/`: uv project + FastAPI + `GET /health`
  - `frontend/`: Vite + React + TypeScript + Tailwind + shadcn/ui
  - `docker-compose.yml` and two Dockerfiles
  - ruff, Prettier, and ESLint config
  - Update `.env.example` and `.gitignore` (add `logs/`)
- Done when: after `docker compose up`, the frontend loads and shows the result of `/health`.

**Step 3: Each of us builds one small vertical feature**

| | A: "Ask the model" | B: "Saves list" |
|---|---|---|
| Frontend | Input box + button, shows the model's reply | Shows saves as a list of cards |
| Endpoints | `POST /hello` | `GET /saves`, `GET /personas` |
| Backend logic | `backend/tools/llm.py`: call OpenRouter + logging + JSON parsing and retry | `backend/db/`: SQLModel tables; load JSON from `data/` on startup |
| What you learn | Calling LLMs, logging | Databases, data shapes |

Then review each other's PR and walk each other through how it works.

**Step 4: Agree on the contract together (~2 hours)**
- `backend/db/schemas.py`: Save, Nugget, Intent, Profile
- `docs/api.md`: the endpoint list

**Step 5: Prepare data together**
- `data/fixtures/saves.json`: 5 hand-written saves (Tokyo ramen, tomato egg stir-fry, tennis backhand, fall outfits, kittens fighting), with hand-written Nuggets for now
- `data/personas/mia.json`, `leo.json`: 2 fictional personas (survey answers + profile)
- `eval/labels.json`: hand-labeled correct intents ⚠️ **write these before seeing any model output**
- Each of us also starts collecting ~20 public video links (needed in M2)

**Step 6 (optional): Update docs**
- `CLAUDE.md`: stack table + Commands (install and run)
- `README.md`: Getting started

### 6.3 Data shapes (draft)

```python
IntentType = Literal["visit", "try_cook", "learn_practice", "buy",
                     "taste_preference", "just_for_fun"]
Decision   = Literal["silent", "ask", "preference_only", "suggest_now"]

class Nugget:   t: str | None;  text: str
class Save:     id; url; title; category; nuggets: list[Nugget]; saved_at
class Intent:   type: IntentType; confidence: float; reason: str; decision: Decision
class Profile:  id; name; summary; survey: dict;
                proactivity: "only_when_asked" | "weekly" | "moments";
                category_habits: dict[str, dict[str, int]]
```

### 6.4 Endpoints for M0 / M1 (draft)

| Endpoint | Milestone | What it does |
|---|---|---|
| `GET /health` | M0 | Check the backend is running |
| `POST /hello` | M0 | Send a message to the model, return its reply |
| `GET /saves` | M0 | List all saves |
| `GET /personas` | M0 | List all personas |
| `POST /intent/preview` | M1 | Save id + persona id + version → Intent |
| `POST /profile/survey` | M1 | Survey answers → Profile |

### 6.5 What M0 looks like when it's done

**`http://localhost:5173`:**

```text
┌──────────────────────────────────────────────────────┐
│  ReMind (M0)             [ Ask the model ] [ Saves ]  │
├──────────────────────────────────────────────────────┤
│  Ask the model                                        │
│  [ Introduce yourself in one sentence    ] [Send]     │
│  Reply: I'm an AI assistant that…                     │
├──────────────────────────────────────────────────────┤
│  Saves                                                │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐        │
│  │🍜 Tokyo     │ │🍳 Tomato    │ │🎾 Tennis    │ …      │
│  │   ramen    │ │   egg      │ │   backhand │        │
│  │ food       │ │ recipe     │ │ sports     │        │
│  └────────────┘ └────────────┘ └────────────┘        │
└──────────────────────────────────────────────────────┘
```

**`http://localhost:8000/docs`:** auto-generated API docs listing the 4 endpoints, each testable with a button.

**`logs/llm_calls.jsonl`:** one line per model call.

**Done when:**
- [ ] `docker compose up` works first try on both machines
- [ ] React → FastAPI → OpenRouter → back to the page works end to end
- [ ] Data shapes, endpoint list, hand-written data, and labels are merged into main
- [ ] Both of us have written frontend and backend code and reviewed each other

---

## 7. M1: The agent's "brain"

**Goal:** test whether the core idea holds: the same save, different people, different agent judgments.

### 7.1 What we need to agree on first

- [ ] The `infer_intent` signature (both versions must match so the eval script can call either)
- [ ] A definition for each of the 6 intents (written down; both prompts follow it)
- [ ] Evaluation method: how we compute accuracy, and how the baseline works (no profile)
- [ ] Survey questions (6–8, each tied to a decision it affects)

### 7.2 Steps

**Step 1: Prompt face-off (each of us writes one version)**
- A writes `backend/agents/save_loop/intent_v_a.py`, B writes `intent_v_b.py`
- Shared signature:

```python
def infer_intent(save: Save, profile: Profile | None, history: list[Save]) -> Intent:
```

- `profile=None` is the content-only baseline.
- A good prompt usually has: a role; definitions and examples for the 6 intents; reasoning rules (look for evidence first, lower confidence when there is none); decision rules; a requirement that the reason cite specific evidence; JSON-only output.
- Try different designs: few-shot examples or not, reasoning before the answer or not, how many past saves to include…

**Step 2: Each of us builds one vertical feature**

| | A: "Side-by-side" | B: "Survey → Profile" |
|---|---|---|
| Frontend | Pick a save; see two personas' judgments side by side | Survey page (6–8 questions) |
| Endpoint | `POST /intent/preview` | `POST /profile/survey` |
| Backend logic | Call the right `infer_intent` for the persona and version | Have the model turn survey answers into a Profile (B's second prompt) |

**Step 3: Eval script (A writes, B reviews)**
- `eval/run_m1.py`: for every persona × save, call the baseline, version A, and version B, compare with the labels, and print a score table.
- Also compare 2–3 OpenRouter models (same prompt, different model name).

**Step 4: Iterate**
- When an answer is wrong, open `logs/llm_calls.jsonl` and see what the model received and returned. Find the cause: unclear intent definitions? Missing profile info? A debatable label?
- Rerun the score table after every prompt change, and note "what changed → how the score moved" in the PR.

**Step 5: Face-off meeting (~1 hour)**
- Run the score table together. Each of us takes 10 minutes: how we designed the prompt, which saves kept failing, and why.
- Merge the best of both → `intent.py`, and delete the two experimental versions.
- **Add 5 new saves with labels** to check the merged version doesn't only work on the original 5 (overfitting).
- Pick the agent's default model based on score and price.

### 7.3 What M1 looks like when it's done

**Side-by-side page:**

```text
┌───────────────────────────────────────────────────────────────┐
│  Save: 🍜 Top 5 ramen spots in Tokyo          [Switch ▼]      │
├──────────────────────────────┬────────────────────────────────┤
│  👩 Mia                       │  👨 Leo                         │
│  Intent: Visit                │  Intent: Just for fun           │
│  Confidence: 0.85             │  Confidence: 0.78               │
│  Reason: You said in the      │  Reason: You marked your past   │
│  survey you're visiting Japan │  food saves as "just looking,"  │
│  in December, and you've      │  and you haven't mentioned a    │
│  saved 4 Tokyo posts lately.  │  trip to Japan.                 │
│  Decision: 🔕 Save quietly    │  Decision: 🏷️ Preference only   │
│                               │  (likes ramen)                  │
└──────────────────────────────┴────────────────────────────────┘
```

**Survey page:** fill in the survey → see the Profile the model built → use it as a new persona in the comparison.

**Score table in the terminal:**

```text
Save            Persona   Baseline       Version A          Version B
Tokyo ramen     Mia       visit ✓        visit 0.85 ✓       visit 0.80 ✓
Tokyo ramen     Leo       visit ✗        just_for_fun ✓     taste ✗
Tennis backhand Leo       learn ✗        just_for_fun ✓     just_for_fun ✓
…
Accuracy: baseline 50% | A 80% | B 70%
Models: model X 80% ($0.02) | model Y 75% ($0.01) | model Z 60% ($0.005)
```

> **The accuracy jump from baseline to "with profile" is ReMind's first piece of evidence.** We'll use it in the README and every demo.

**Done when:**
- [ ] The same save gets different intents for the two personas, with reasons citing the profile or save history
- [ ] Accuracy with profile is clearly higher than the baseline
- [ ] The merged `intent.py` also does well on the 5 new saves
- [ ] Survey → Profile works end to end
- [ ] The agent's default model is chosen

---

## 8. Avoiding conflicts when we both write frontend and backend

1. **Each feature gets its own files:**
   - Backend: `backend/api/routes/hello.py`, `backend/api/routes/saves.py`, …
   - Frontend: `frontend/src/pages/Hello.tsx`, `frontend/src/pages/Saves.tsx`, …
2. **Keep changes to shared files small, and get the other person's review:**
   - `backend/api/main.py` (registering endpoints) and the frontend router (registering pages): one line per change
   - `backend/db/schemas.py` (data shapes): tell the other person before changing a field
3. **Branch names:** `<area>/<short-description>`, e.g. `save_loop/intent-prompt-a`.
4. **One branch per task.** Merge quickly, and **`git pull` before starting each day**.
5. **Every PR explains how it works.** Merge once the other person understands it.

---

## 9. Open questions for both of us

1. Python version (3.12 suggested)
2. Do we both agree with the proposed stack in §3.2?
3. Who is A and who is B?
4. Do the 6 intent definitions need changes?
5. Survey questions
6. The 2 personas (are Mia / Leo right?)
7. Merge PR #2 (adds "how we get saved videos" to the meeting notes)?
8. When do we each request our TikTok / IG data exports?

---

### References
- [SousVid (GitHub)](https://github.com/leshicodes/SousVid)
- [claude-real-video](https://www.everydev.ai/tools/claude-real-video/llms.txt)
- [OpenRouter multimodal docs](https://openrouter.ai/docs/guides/overview/multimodal/overview)
- [TikTok data export guide](https://takeoutday.org/guides/how-to-export-tiktok-data)
- [Instagram data export guide](https://takeoutday.org/guides/how-to-export-instagram-data)
