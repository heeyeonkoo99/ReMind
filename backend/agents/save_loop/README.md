# Loop 1: Save Loop

**Owner:** TBD

Fast and quiet. Runs every time the user saves something.

| Step | Input | Output |
|---|---|---|
| ① Content understanding | Video link / file | Transcript, key-frame descriptions, captions |
| ② Nugget extraction | ① | Timestamped `nuggets[]`, `entities[]`, `category` |
| ③ **Personal intent inference** | Nuggets + profile + recent saves + category history | `intent`, `confidence`, `reason` |
| ④ Goal linker | New save + existing goals | Goal assignment / new goal, updated status |
| ⑤ **Save decision** | ③ + ④ + proactivity preference | Stay quiet / ask one-tap / record preference only / suggest action now |

Intent types: `visit` / `try_cook` / `learn_practice` / `buy` / `taste_preference` / `just_for_fun`

The `reason` must reference the profile or history (e.g. "Because you said you're visiting Japan in December").
