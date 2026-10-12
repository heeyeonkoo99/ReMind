# backend/db

**Owner:** TBD

Storage for the three core objects. Starting point (from plan §8.4):

```jsonc
// Save
{ "id": "s_012", "url": "...", "nuggets": [{"t": "0:42", "text": "..."}],
  "entities": [{"type": "place", "name": "..."}], "category": "food",
  "intent": {"type": "visit", "confidence": 0.82, "reason": "..."},
  "goal_id": "g_tokyo", "decision": "silent", "feedback": null }

// Goal
{ "id": "g_tokyo", "title": "Tokyo Trip", "status": "emerging",
  "save_ids": ["s_003"], "evidence": "...", "last_triggered": null }

// Profile
{ "summary": "...", "proactivity": "moments_only", "quiet_hours": ["22:00-08:00"],
  "category_habits": { "recipe": {"try": 1, "just_for_fun": 6} } }
```

Goal status: `dormant` → `emerging` → `active` → `done`, plus `fading`.
