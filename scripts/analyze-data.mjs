// Season analysis straight from garmin-api: `npm run analyze` (needs GARMIN_API_TOKEN, see .env.example).
// Replaces the old version that read a 22 MB local export of Garmin activities.
import { existsSync } from 'node:fs';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');

const base = (process.env.GARMIN_API_URL ?? 'https://garmin-api.nicode.eu').replace(/\/+$/, '');
const token = process.env.GARMIN_API_TOKEN ?? process.env.TRAINING_COACH_GARMIN_API_TOKEN;
if (!token) {
  console.error('GARMIN_API_TOKEN is not set (see .env.example)');
  process.exit(1);
}

// Season window: 2025 onwards (same as before)
const FROM = process.env.ANALYZE_FROM ?? '2025-01-01';

async function fetchAll() {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const res = await fetch(`${base}/v1/activities?from=${FROM}&limit=500&offset=${offset}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data, meta } = await res.json();
    rows.push(...data);
    if (offset + 500 >= meta.total) return rows;
  }
}

const all = await fetchAll();
// A triathlon is a "multisport" parent plus one activity per leg: count the legs only
const activities = all.filter((a) => a.sport !== 'multisport');

const byType = {};
let distance = 0;
let duration = 0;
for (const a of activities) {
  byType[a.type_key] = (byType[a.type_key] || 0) + 1;
  distance += a.distance_m ?? 0;
  duration += a.duration_s ?? 0;
}

console.log(`📊 **Training Analysis (since ${FROM})**`);
console.log(`- **Total Sessions:** ${activities.length}`);
console.log(`- **Total Distance:** ${(distance / 1000).toFixed(1)} km`);
console.log(`- **Total Time:** ${(duration / 3600).toFixed(1)} hours`);

console.log('\n🏃 **Activity Breakdown:**');
for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) console.log(`  - ${type}: ${count}`);

// Run-specific stats for the XTri goal
const runs = activities.filter((a) => a.type_key === 'running');
const runDist = runs.reduce((sum, r) => sum + (r.distance_m ?? 0), 0);
console.log('\n🏔️ **XTri Prep (Running):**');
console.log(`  - Total Run Volume: ${(runDist / 1000).toFixed(1)} km`);
console.log(`  - Avg Run Distance: ${(runDist / 1000 / runs.length || 0).toFixed(1)} km`);
