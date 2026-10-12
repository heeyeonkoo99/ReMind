# backend/api

**Owner:** TBD

## Scope
Endpoints the frontend calls. Rough list (to be finalized):
- `POST /profile/survey`: submit the onboarding survey
- `POST /saves`: save a link or video → runs the save loop
- `POST /saves/{id}/feedback`: one-tap feedback
- `POST /import`: upload a TikTok/IG data export
- `GET /goals`: list goals and their status
- `POST /context`: Context Simulator input → runs the moment loop
- `POST /ask`: user question → runs a workflow
