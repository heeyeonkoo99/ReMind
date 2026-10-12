# backend

| Folder | Scope |
|---|---|
| `api/` | Endpoints the frontend calls |
| `agents/profile/` | Survey, feedback, and history import → profile |
| `agents/save_loop/` | Loop 1: what happens when the user saves |
| `agents/moment_loop/` | Loop 2: when the agent acts proactively |
| `agents/workflows/` | Loop 3: intent router + Travel / Cooking workflows |
| `tools/` | Wrappers for external APIs and model calls |
| `db/` | Data models and storage |

See section 8 of the plan in `docs/` for the full agent workflow.
