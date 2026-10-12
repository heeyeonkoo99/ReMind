# backend/tools

**Owner:** TBD

Thin wrappers around external services, used by the agents.

- Places (location, business hours, open/closed)
- Weather
- Web search
- yt-dlp (metadata first; download the full video only for active goals)
- ASR / VLM model calls (Nebius / NVIDIA)

Keys come from `.env`. Never hard-code them.
