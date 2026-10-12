# Loop 2: Moment Loop

**Owner:** TBD

The agent decides when to act proactively, and when to stay quiet.

| Step | Input | Output |
|---|---|---|
| ⑥ Context signal | Context Simulator: date, time, location, calendar events | Current context description |
| ⑦ Goal matcher | Context + emerging/active goals | Candidate goals + relevance scores |
| ⑧ **Interrupt judge** | Candidates + profile (proactivity, quiet hours) + recent notifications | Notify / don't notify + reason |

Rules: at most 1–2 notifications per day; no proactive notifications if the user chose "Only when I ask".
