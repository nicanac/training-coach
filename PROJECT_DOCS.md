# Training Coach - Project Documentation

## 🎯 Project Overview

AI-powered training dashboard for Nicnac's XTri preparation. Integrates Garmin data, fatigue analysis, and dynamic coaching.

**Repository:** https://github.com/nicanac/training-coach  
**Created:** 2026-01-27

---

## 🛠️ Tech Stack

- **Next.js 16** (App Router, React 19, Turbopack)
- **Supabase** (PostgreSQL) - 6,000+ activities stored
- **Tailwind CSS v4** + Recharts for visualizations
- **TypeScript** + Server Actions
- **Garmin Connect API** integration

---

## ✅ Features Completed

- [x] Garmin data sync (6,000+ activities uploaded)
- [x] Supabase database schema with activities table
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
│   │   ├── page.tsx          # Main dashboard
│   │   ├── actions.ts        # Server actions (plan gen)
│   │   └── globals.css       # Tailwind
│   ├── components/
│   │   ├── TrainingPlan.tsx  # Dynamic plan UI
│   │   ├── WeeklyLoadChart.tsx
│   │   └── ui/card.tsx
│   └── lib/
│       └── supabase.ts       # DB client
├── scripts/
│   ├── download-all-garmin.js
│   ├── upload-to-supabase.js
│   └── analyze-data.js
└── data/
    └── garmin_activities_all.json
```

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
- [ ] Deploy to Vercel with environment variables
- [ ] Mobile responsive refinements

---

## 💾 Database Schema

```sql
CREATE TABLE activities (
  activity_id BIGINT PRIMARY KEY,
  name TEXT,
  type TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  distance NUMERIC,
  duration NUMERIC,
  calories INTEGER,
  avg_hr INTEGER,
  max_hr INTEGER,
  elevation_gain NUMERIC,
  avg_speed NUMERIC,
  avg_power NUMERIC,
  raw_data JSONB
);
```

---

## 🔑 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=... (for scripts)
```

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
- Supabase bulk inserts need batching (250 rows max per request)
- Server Actions simplify data fetching, but need proper `'use client'` boundaries
- Tailwind v4's new `@import "tailwindcss"` syntax requires PostCSS adjustments

---

*Last updated: 2026-01-27*
