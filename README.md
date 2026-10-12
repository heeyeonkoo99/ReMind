# ReMind

> Same saves. Different people. Different actions.

ReMind is a personal agent that treats your saves (TikTok, Reels, Shorts) as signals of intent. It infers why **you** saved something and turns it into the smallest next step at the right moment.

Nebius × NVIDIA Global AI Hackathon, Personal AI / Best App track
- Internal demo: **Oct 21**
- Submission: **Oct 29** (deadline Oct 30, 10:00 a.m. PDT)

The full plan is in [`docs/`](docs/).

## Repo structure

| Folder | What lives here | Owner |
|---|---|---|
| [`frontend/`](frontend/) | Web app, onboarding survey, Context Simulator, persona side-by-side view | TBD |
| [`backend/api/`](backend/api/) | REST endpoints the frontend calls | TBD |
| [`backend/agents/save_loop/`](backend/agents/save_loop/) | Loop 1: content understanding → Nuggets → personal intent → goal linker → save decision | TBD |
| [`backend/agents/moment_loop/`](backend/agents/moment_loop/) | Loop 2: goal matcher + interrupt judge | TBD |
| [`backend/agents/workflows/`](backend/agents/workflows/) | Loop 3: intent router + Travel and Cooking workflows | TBD |
| [`backend/tools/`](backend/tools/) | External tools: Places, weather, search, yt-dlp, model calls | TBD |
| [`backend/db/`](backend/db/) | Schemas and storage for Save / Goal / Profile | TBD |
| [`data/`](data/) | Synthetic personas and demo fixtures | TBD |
| [`eval/`](eval/) | Labeled ground truth + evaluation scripts | TBD |
| [`docs/`](docs/) | Plan, architecture, demo script | TBD |

Each folder has its own README describing its scope. Owners, please put your name in the table above and in your folder's README.

## Ground rules

1. **No real personal data in the repo.** Real TikTok/Instagram exports go in `data/raw/`, which is gitignored. Only commit synthetic data.
2. **No secrets in the repo.** Copy `.env.example` to `.env` and fill in your keys. `.env` is gitignored.
3. Work on a branch and open a PR to `main`. Keep PRs small.

## Getting started

```bash
cp .env.example .env   # then fill in your keys
```

Setup steps for the frontend and backend will be added once the stack is decided.
