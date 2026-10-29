# CLAUDE.md

Guidance for Claude (and humans) working in this repo. Read this first, then the README in the folder you're working on.

## What ReMind is

A personal agent that treats social-media saves as signals of intent. The same save means different things to different people, so ReMind infers **why this person** saved something (content × profile × context) and either stays quiet or suggests the smallest next step at the right moment.

- Full plan: [docs/ReMind_plan_v1_en.md](docs/ReMind_plan_v1_en.md). Section 8 has the agent workflow and data structures.
- Current milestones and how we build them: [docs/m0-m1-plan.md](docs/m0-m1-plan.md)
- No fixed deadline. We build milestone by milestone (M0–M6), and both of us learn the full agent-development process.

## Tech stack

| | Choice |
|---|---|
| Environment | Docker + Docker Compose (`api` and `web` services) |
| Backend | Python 3.12, FastAPI, uv for dependencies |
| Frontend | Vite + React + TypeScript, Tailwind CSS (shadcn/ui when we need components) |
| Storage | SQLite + SQLModel |
| Models | OpenRouter (OpenAI-compatible API) via the shared helper `backend/tools/llm.py`. Configured in `.env` with `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` |
| ASR / video | faster-whisper, yt-dlp, ffmpeg (from M2) |
| Agent framework | None. We write the agent loop ourselves with the OpenAI SDK. Official MCP SDK in M4 |
| Formatting | ruff (Python); Prettier + ESLint (frontend) |

- Stick to this stack. If something new seems needed (a library, a service, a framework), ask the human before adding it.
- Every model call goes through `backend/tools/llm.py`, which logs it to `logs/llm_calls.jsonl`.

### Commands

Run from the repo root with Docker Desktop open. Needs a `.env` (copy `.env.example`).

| Command | What it does |
|---|---|
| `docker compose up --build` | Build (first time or after dependency changes) and start everything |
| `docker compose up` | Start everything |
| `docker compose down` | Stop |
| `docker compose logs -f api` | Follow backend logs |

- Frontend: http://localhost:5173 (calls the backend through `/api/...`)
- Backend API docs: http://localhost:8000/docs
- Tests: TBD

## Repo map

Each folder has a README with its scope and owner.

| Folder | Scope |
|---|---|
| `frontend/` | Web app: survey, save cards, goals, Context Simulator, persona side-by-side |
| `backend/api/` | HTTP endpoints the frontend calls |
| `backend/agents/profile/` | Survey → profile, feedback → profile updates, history import |
| `backend/agents/save_loop/` | Loop 1: save → nuggets → intent → goal → decision |
| `backend/agents/moment_loop/` | Loop 2: context → goal match → interrupt judge |
| `backend/agents/workflows/` | Loop 3: router + Travel / Cooking workflows |
| `backend/tools/` | External APIs and model calls |
| `backend/db/` | Storage for Save / Goal / Profile |
| `data/` | Synthetic personas and demo saves |
| `eval/` | Ground-truth labels and evaluation scripts |
| `docs/` | Plan and other docs |

## Rules

1. **Change only your own features.** We split work vertically, so each of us owns features end to end (frontend + backend). Shared files (`backend/api/main.py`, the frontend router, `backend/db/schemas.py`, `docker-compose.yml`) need the other person's review.
2. **Shared data shapes follow plan §8.4** (Save / Goal / Profile). If you need to add or change a field, say so in your PR description so other owners can adjust. Never silently rename or drop a field.
3. **Every agent decision carries a reason** that cites the user's profile or save history (e.g. "Because you said you're visiting Japan in December"). This is the core of the demo.
4. **Every output item links back to the save it came from.**
5. **Keep it simple.** No multi-agent frameworks, no scraping, no logging into users' social accounts (out of scope per the plan).
6. **No secrets or real personal data in git.** Keys go in `.env` (copy `.env.example`). Real TikTok/IG exports go in `data/raw/` (gitignored).

## Workflow

- Branch from `main` as `<area>/<short-description>` (e.g. `save_loop/intent-inference`).
- Small PRs into `main`. The other person reviews before merging.
- Every PR explains how it works.
- If your area's scope changes, update its README.
