// Smoke test for the garmin-api connection: `npm run check:api`
// Needs GARMIN_API_TOKEN (and optionally GARMIN_API_URL), e.g. `npm run check:api:doppler`.
import { existsSync } from 'node:fs';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');

const base = (process.env.GARMIN_API_URL ?? 'https://garmin-api.nicode.eu').replace(/\/+$/, '');
const token = process.env.GARMIN_API_TOKEN ?? process.env.TRAINING_COACH_GARMIN_API_TOKEN;
if (!token) {
  console.error('GARMIN_API_TOKEN is not set (see .env.example)');
  process.exit(1);
}

const get = async (path) => {
  const res = await fetch(base + path, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return (await res.json()).data;
};

try {
  const status = await get('/v1/status');
  const age = status.data_age_minutes;
  console.log(`garmin-api   ${base}`);
  console.log(`Garmin auth  ${status.garmin_auth.state}`);
  console.log(`last sync    ${age === null ? 'never' : `${age} min ago`} · next ${status.next_runs[0] ?? '-'}`);
  console.log(`activities   ${status.counts.activities} (${status.activities_span.first?.slice(0, 10)} -> ${status.activities_span.last?.slice(0, 10)})`);
  const snap = await get('/v1/snapshot?days=1&activities=1&weeks=0');
  console.log(`readiness    ${snap.latest.readiness_score ?? '-'} (${snap.latest.readiness_level ?? '-'}) · HRV ${snap.latest.hrv_last_night ?? '-'} · resting HR ${snap.latest.resting_hr ?? '-'}`);
  if (status.garmin_auth.state !== 'ok') process.exit(2);
} catch (e) {
  console.error(`FAILED: ${e.message}`);
  process.exit(1);
}
