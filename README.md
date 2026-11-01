# Training Coach

AI-powered training dashboard for the XTri preparation: weekly load, recovery, a fatigue-aware 7-day plan, all built on Garmin data.
More detail: [PROJECT_DOCS.md](PROJECT_DOCS.md).

## Data source

Everything comes from **[garmin-api](https://garmin-api.nicode.eu)** (repo `nicanac/garmin-api`): a worker pulls Garmin Connect
4x/day into Postgres and this app reads that cache with a read-only bearer token. The app never logs in to Garmin and has no database.

## Run it

```bash
npm ci
npm run dev:doppler     # token + URL injected from Doppler (project nicode, config prd); only those two secrets are passed
npm run check:api:doppler   # connection smoke test: Garmin auth, last sync, activity count, readiness
npm run analyze             # season stats straight from the API
```

Without Doppler, copy `.env.example` to `.env.local` and set `GARMIN_API_TOKEN`, then `npm run dev`.

## Deploy (Vercel)

Add `GARMIN_API_TOKEN` (and optionally `GARMIN_API_URL`) to the project's environment variables, server-side only.
The dashboard is rendered per request, so the build needs no token.
