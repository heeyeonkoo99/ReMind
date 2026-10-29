# CLAUDE.md

Guidance for Claude (and humans) working in this repo. Read this first, then the README in the folder you're working on.

## What ReMind is

A personal agent that treats social-media saves as signals of intent. The same save means different things to different people, so ReMind infers **why this person** saved something (content × profile × context) and either stays quiet or suggests the smallest next step at the right moment.

- Full plan: [docs/ReMind_plan_v1_en.md](docs/ReMind_plan_v1_en.md). Section 8 has the agent workflow and data structures.
- Internal demo **Oct 21**, submission **Oct 29**

## Tech stack

See [docs/m0-m1-plan.md](docs/m0-m1-plan.md) §3. Don't add new dependencies or swap a choice below without asking the human first.

| | Choice |
|---|---|
| Environment | Docker + docker compose (`api` and `web` containers) |
| Backend | Python 3.12, FastAPI, uv |
| Frontend | Vite + React + TypeScript |
| Storage | SQLite + SQLModel (planned) |
| Models (ASR / VLM / LLM) | OpenRouter for VLM / LLM; faster-whisper (local) for ASR. Specific models TBD in M1 |

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

1. **Stay in your folder.** Don't change another area's code; tell its owner instead.
2. **Shared data shapes follow plan §8.4** (Save / Goal / Profile). If you need to add or change a field, say so in your PR description so other owners can adjust. Never silently rename or drop a field.
3. **Every agent decision carries a reason** that cites the user's profile or save history (e.g. "Because you said you're visiting Japan in December"). This is the core of the demo.
4. **Every output item links back to the save it came from.**
5. **Keep it simple.** No multi-agent frameworks, no scraping, no logging into users' social accounts (out of scope per the plan).
6. **No secrets or real personal data in git.** Keys go in `.env` (copy `.env.example`). Real TikTok/IG exports go in `data/raw/` (gitignored).

## Workflow

- Branch from `main` as `<area>/<short-description>` (e.g. `save_loop/intent-inference`).
- Small PRs into `main`.
- If your area's scope changes, update its README.
