# CLAUDE.md

Guidance for Claude (and humans) working in this repo. Read this first, then the README in the folder you're working on.

## What ReMind is

A personal agent that treats social-media saves as signals of intent. The same save means different things to different people, so ReMind infers **why this person** saved something (content × profile × context) and either stays quiet or suggests the smallest next step at the right moment.

- Full plan: [docs/ReMind_plan_v1_en.md](docs/ReMind_plan_v1_en.md). Section 8 has the agent workflow and data structures.
- Internal demo **Oct 21**, submission **Oct 29**

## Tech stack

**Not decided yet.** The team will decide in a meeting.

- Until this section is filled in, do **not** pick a language, framework, or database, or add dependencies on your own. Ask the human first.
- Once decided, replace this section with the actual stack and add the commands below.

| | Choice |
|---|---|
| Backend | TBD |
| Frontend | TBD |
| Storage | TBD |
| Models (ASR / VLM / LLM) | TBD |

### Commands

TBD: install, run backend, run frontend, run tests.

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
