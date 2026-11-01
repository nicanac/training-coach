// Server-side client for garmin-api (https://garmin-api.nicode.eu): the one source of Garmin data.
//
// A worker there pulls from Garmin Connect 4x/day into Postgres and this app only reads that cache, so
// nothing here ever logs in to Garmin. Import this module from server code only (server components,
// server actions, route handlers): the bearer token must never reach the browser.
//
// Env (see .env.example):
//   GARMIN_API_TOKEN  read-only token (`scripts/ops.sh token create <label>` in the garmin-api repo)
//   GARMIN_API_URL    optional, defaults to https://garmin-api.nicode.eu
// Locally, `npm run dev:doppler` injects them from Doppler (project nicode, key TRAINING_COACH_GARMIN_API_TOKEN).

import { format, parseISO, startOfWeek } from 'date-fns';

const BASE = (process.env.GARMIN_API_URL ?? 'https://garmin-api.nicode.eu').replace(/\/+$/, '');

/** Garmin "days" are local calendar days; the API works in this timezone. */
export const TIMEZONE = 'Europe/Brussels';

export type Sport = 'run' | 'bike' | 'swim' | 'multisport' | 'strength' | 'walk' | 'other';

export type ApiActivity = {
  activity_id: number;
  /** Wall clock where it happened, e.g. "2026-11-01T08:07:12" (no timezone). */
  start_time_local: string;
  name: string | null;
  /** Garmin typeKey: running, road_biking, lap_swimming ... */
  type_key: string | null;
  sport: Sport;
  distance_m: number | null;
  duration_s: number | null;
  elapsed_s: number | null;
  elevation_gain_m: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  avg_power_w: number | null;
  calories: number | null;
  training_load: number | null;
};

export type Totals = {
  activities: number;
  duration_s: number;
  distance_m: number;
  elevation_gain_m: number;
  training_load: number;
  calories: number;
};

export type PeriodSummary = { period: string; totals: Totals; by_sport: Record<string, Totals> };

/** Best-effort headline numbers; any field is null when Garmin has no value for it. */
export type Headline = {
  steps: number | null;
  resting_hr: number | null;
  avg_stress: number | null;
  body_battery_high: number | null;
  body_battery_low: number | null;
  sleep_score: number | null;
  sleep_hours: number | null;
  hrv_last_night: number | null;
  hrv_weekly_avg: number | null;
  hrv_status: string | null;
  readiness_score: number | null;
  readiness_level: string | null;
  vo2max_run: number | null;
  vo2max_bike: number | null;
  training_status: string | null;
  load_acute: number | null;
  load_chronic: number | null;
  load_ratio: number | null;
  weight_kg: number | null;
};

export type Snapshot = {
  as_of: string;
  latest: Headline;
  days: ({ day: string } & Headline)[];
  recent_activities: ApiActivity[];
  weekly_volume: PeriodSummary[];
};

export type ApiStatus = {
  garmin_auth: { state: 'ok' | 'needs_login' | 'unknown' };
  sync_running: boolean;
  data_age_minutes: number | null;
  next_runs: string[];
};

export class GarminApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`garmin-api ${path} answered HTTP ${status}`);
  }
}

function token(): string {
  const t = process.env.GARMIN_API_TOKEN ?? process.env.TRAINING_COACH_GARMIN_API_TOKEN;
  if (!t) throw new Error('GARMIN_API_TOKEN is not set (see .env.example)');
  return t;
}

type Params = Record<string, string | number | undefined>;

/** GET <garmin-api><path>; responses are `{ data, meta }`. `revalidate` = seconds the fetch cache may reuse it. */
export async function garminGet<T>(path: string, params: Params = {}, revalidate = 300): Promise<{ data: T; meta: Record<string, unknown> }> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}` }, next: { revalidate } });
  if (!res.ok) throw new GarminApiError(res.status, path);
  return res.json();
}

export const garmin = {
  activities: (p: { from?: string; to?: string; sport?: string; limit?: number; offset?: number; order?: 'asc' | 'desc' } = {}) =>
    garminGet<ApiActivity[]>('/v1/activities', p),
  summary: (p: { group: 'day' | 'week' | 'month'; from?: string; to?: string; sport?: string }) =>
    garminGet<PeriodSummary[]>('/v1/activities/summary', p),
  snapshot: (p: { days?: number; activities?: number; weeks?: number } = {}) => garminGet<Snapshot>('/v1/snapshot', p),
  status: () => garminGet<ApiStatus>('/v1/status', {}, 0),
};

// --- dates ---------------------------------------------------------------------------------------

/** Today's date (YYYY-MM-DD) in the athlete's timezone, whatever the server's clock zone is (Vercel = UTC). */
export function localToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date());
}

/** Monday (YYYY-MM-DD) of the ISO week containing `date`; the API's weeks start on Monday too. */
export function weekStart(date: string): string {
  return format(startOfWeek(parseISO(date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}
