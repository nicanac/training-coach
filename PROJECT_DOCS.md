# Training Coach - Project Documentation

## 🎯 Project Overview

AI-powered training dashboard for Nicnac's XTri preparation. Integrates Garmin data, fatigue analysis, and dynamic coaching.

**Repository:** https://github.com/nicanac/training-coach  
**Created:** 2026-01-27

---

## 🛠️ Tech Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **garmin-api** (https://garmin-api.nicode.eu) - the only data source: Garmin Connect cached in Postgres, synced 4x/day, read over REST with a bearer token (repo `nicanac/garmin-api`)
- **Tailwind CSS v4** + Recharts for visualizations
- **TypeScript** + Server Actions

---

## ✅ Features Completed

- [x] Garmin data from garmin-api (6,000+ activities back to 2015, daily sleep/HRV/readiness/training status)
- [x] Dashboard stats, weekly chart and recovery card driven by real data (no mocks)
- [x] Modern dashboard UI (sidebar, stats cards, activity feed)
- [x] Dynamic training plan generator with fatigue analysis (TSB/ATL/CTL)
- [x] Weekly load chart (Recharts)
- [x] AI Coach insight card (hardcoded for now)

---

## 📁 Architecture

```
training-coach/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main dashboard (server component, reads garmin-api per request)
│   │   ├── actions.ts        # Server actions (plan gen, sync status)
│   │   └── globals.css       # Tailwind
│   ├── components/
│   │   ├── TrainingPlan.tsx  # Dynamic plan UI
│   │   ├── SyncGarminButton.tsx  # Shows data freshness + next sync
│   │   ├── WeeklyLoadChart.tsx
│   │   └── ui/card.tsx
│   └── lib/
│       └── garmin-api.ts     # Server-side client for garmin-api (typed)
└── scripts/
    ├── check-garmin-api.mjs  # npm run check:api  - connection smoke test
    ├── analyze-data.mjs      # npm run analyze    - season stats from the API
    └── create-notion-doc.js
```

Garmin login, the Supabase upload scripts, the 22 MB `garmin_activities_all.json` export and the Supabase client were removed
when the app switched to garmin-api (2026-11-01); they stay in git history. The export's 6,023 activities were verified to be
in garmin-api before it was deleted.

---

## 🧠 Training Plan Logic

The system calculates **Training Stress Balance (TSB)** from recent activities:

- **ATL** (Acute Training Load): 7-day rolling average
- **CTL** (Chronic Training Load): 28-day rolling average  
- **TSB** (Training Stress Balance): CTL - ATL
  - Positive = Fresh
  - Negative = Fatigued

**Rules:**
- Sunday: Long ride (Z2)
- Weekday mornings: Swim sessions
- Saturday: Hill reps if fresh (TSB > -10), otherwise recovery spin
- Wednesday: Tempo run
- Friday: Strength & core
- Monday: Rest

---

## 🚀 Roadmap (Next Steps)

- [ ] Ollama AI integration for real-time coaching
- [ ] Analytics page (trends, volume charts, HR zones)
- [ ] Race-specific training modules (XTri vertical gain prep)
- [ ] Deploy to Vercel (set `GARMIN_API_TOKEN`, see Environment Variables)
- [ ] Mobile responsive refinements

---

## 💾 Data

No database in this app. Activities, daily metrics (sleep, HRV, readiness, training status) and snapshots live in garmin-api's
Postgres and are read through `src/lib/garmin-api.ts`. Activity fields used here: `activity_id, start_time_local, name, sport,
type_key, distance_m, duration_s, avg_hr, max_hr`. `sport` (run / bike / swim / multisport / strength / walk / other) groups Garmin's
activity types; a triathlon is a `multisport` parent plus one activity per leg, so load and totals count the legs only.

---

## 🔑 Environment Variables

```bash
GARMIN_API_TOKEN=...   # read-only bearer token for garmin-api (server-side only, never NEXT_PUBLIC_)
GARMIN_API_URL=https://garmin-api.nicode.eu   # optional, this is the default
```

The token is stored in Doppler (project `nicode`, config `prd`, key `TRAINING_COACH_GARMIN_API_TOKEN`).
Locally: `npm run dev:doppler`. Smoke test: `npm run check:api:doppler`. See `.env.example`.

---

## 📊 Key Stats

- **Total Activities Synced:** 6,000+
- **Total Training Time:** 1,336 hours (2025-2026 season)
- **Run Volume:** 343 km
- **Swim Sessions:** 237 (strongest discipline)
- **Next Race:** The Ascend XTri (104 days)

---

## 🐛 Issues Fixed During Build

1. ✅ React `startTransition` during render → Moved to `useEffect`
2. ✅ Recharts width/height error → Fixed with explicit sizing
3. ✅ Tailwind CSS build errors → Simplified PostCSS config
4. ✅ Layout overlap issues → Fixed grid structure (xl:col-span-2/1)

---

## 💡 Lessons Learned

- Next.js 16 + Turbopack is incredibly fast for local dev
- Reading a cache over REST (garmin-api) beats owning a Garmin login and a database: the app has no sync code at all
- Server Actions simplify data fetching, but need proper `'use client'` boundaries
- Tailwind v4's new `@import "tailwindcss"` syntax requires PostCSS adjustments

---

*Last updated: 2026-11-01 (switched to garmin-api)*
