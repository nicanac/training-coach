
'use server'

import { garmin, localToday } from '@/lib/garmin-api';
import { addDays, format, parseISO, subDays } from 'date-fns';

// --- Types ---
export type DailyPlan = {
  date: string;
  dayName: string;
  activityType: 'Rest' | 'Run' | 'Bike' | 'Swim' | 'Strength';
  focus: string;
  durationMin: number;
  intensity: 'Low' | 'Moderate' | 'High' | 'Severe';
  reasoning: string;
};

// --- Logic ---

// 1. Calculate Load (TSS Approximation)
// Load = Duration (min) * RPE (1-10)
async function getRecentLoad() {
  // Days are local calendar days (Europe/Brussels), the same as the dates garmin-api stores.
  const today = localToday();
  let recentActivities;
  try {
    ({ data: recentActivities } = await garmin.activities({
      from: format(subDays(parseISO(today), 28), 'yyyy-MM-dd'), // Last 4 weeks
      to: today,
      order: 'asc',
      limit: 500,
    }));
  } catch (e) {
    console.error('garmin-api unavailable, planning with a neutral load', e);
    return { atl: 0, ctl: 0, tsb: 0 };
  }

  // Calculate daily load approximation
  // If no HR, assume moderate intensity (RPE 5)
  // If HR, Load = Duration_min * (AvgHR / 180 * 10)
  const dailyLoads: Record<string, number> = {};

  recentActivities
    // A triathlon is stored as a "multisport" parent plus one activity per leg: count the legs only
    .filter(a => a.sport !== 'multisport')
    .forEach(a => {
      const date = a.start_time_local.slice(0, 10);
      const minutes = (a.duration_s ?? 0) / 60;
      let intensityFactor = 0.6; // Default moderate

      if (a.avg_hr) {
          intensityFactor = (a.avg_hr / 185); // Assuming 185 max HR for Nicnac
      }

      const load = minutes * intensityFactor * 100; // Normalized scale
      dailyLoads[date] = (dailyLoads[date] || 0) + load;
    });

  // Simple rolling averages
  let atlSum = 0; // 7 days (Fatigue)
  let ctlSum = 0; // 42 days (Fitness) - abbreviated to 28 here for data availability

  for (let i = 0; i < 28; i++) {
    const d = format(subDays(parseISO(today), i), 'yyyy-MM-dd');
    const load = dailyLoads[d] || 0;
    ctlSum += load;
    if (i < 7) atlSum += load;
  }

  const atl = atlSum / 7;
  const ctl = ctlSum / 28;
  const tsb = ctl - atl; // Form (Positive = Fresh, Negative = Tired)

  return { atl, ctl, tsb };
}

// 2. Generate Plan
export async function generateTrainingPlan(): Promise<DailyPlan[]> {
  const { atl, ctl, tsb } = await getRecentLoad();
  const plan: DailyPlan[] = [];
  const today = parseISO(localToday()); // athlete's calendar day, not the server's (Vercel runs in UTC)

  // XTri Logic:
  // - Need Run volume (Hill reps)
  // - Long bike maintenance
  // - Swim is already strong, maintain 2x/week
  
  // Fatigue logic
  let fatigue = atl; 

  for (let i = 0; i < 7; i++) {
    const currentDay = addDays(today, i);
    const dayName = format(currentDay, 'EEEE');
    const dateStr = format(currentDay, 'yyyy-MM-dd');
    
    let activity: DailyPlan['activityType'] = 'Rest';
    let focus = 'Recovery';
    let duration = 0;
    let intensity: DailyPlan['intensity'] = 'Low';
    let reason = '';

    // Hard Rules from Nicnac's schedule
    if (dayName === 'Sunday') {
        activity = 'Bike';
        focus = 'Long Endurance Ride (Z2)';
        duration = 180;
        intensity = 'Moderate';
        reason = 'Sunday is for long rides. Build aerobic engine.';
    } else if (dayName === 'Saturday') {
        // If fatigued, easy spin. If fresh, brick.
        if (tsb < -10) {
            activity = 'Bike';
            focus = 'Recovery Spin';
            duration = 60;
            intensity = 'Low';
            reason = 'Fatigue is high. Active recovery.';
        } else {
            activity = 'Run';
            focus = 'Hill Reps (XTri Specific)';
            duration = 90;
            intensity = 'High';
            reason = 'Weekend hard session. Target vertical gain for "The Ascend".';
        }
    } else if (['Tuesday', 'Thursday'].includes(dayName)) {
        // Weekday mornings = Swim
        activity = 'Swim';
        focus = dayName === 'Tuesday' ? 'Threshold Intervals' : 'Endurance/Technique';
        duration = 60;
        intensity = dayName === 'Tuesday' ? 'High' : 'Moderate';
        reason = 'Weekday 5AM slot. Maintain swim volume.';
    } else if (dayName === 'Wednesday') {
        // Mid-week run
        activity = 'Run';
        focus = 'Steady State / Tempo';
        duration = 50;
        intensity = 'Moderate';
        reason = 'Mid-week aerobic maintenance.';
    } else if (dayName === 'Monday') {
        // Post-weekend recovery
        activity = 'Rest';
        focus = 'Complete Rest';
        duration = 0;
        intensity = 'Low';
        reason = 'Absorb the weekend volume.';
    } else {
        // Friday
        activity = 'Strength';
        focus = 'Core & Stability';
        duration = 45;
        intensity = 'Moderate';
        reason = 'Prep body for weekend load.';
    }

    plan.push({
        date: dateStr,
        dayName,
        activityType: activity,
        focus,
        durationMin: duration,
        intensity,
        reasoning: reason
    });
  }

  return plan;
}

// 3. Sync Action
// Garmin is pulled into garmin-api by its own worker (4x/day) and this app only reads that cache, so
// there is nothing to start from here: report how fresh the data is and when the next sync runs.
export async function syncGarminData(): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await garmin.status();
    if (data.garmin_auth.state === 'needs_login') {
      return { success: false, message: 'Garmin login expired: run scripts/garmin-login.sh in the garmin-api repo.' };
    }
    const age = data.data_age_minutes;
    const fresh = age === null ? 'No sync has completed yet' : age < 60 ? `Data is ${age} min old` : `Data is ${Math.round(age / 60)} h old`;
    const next = data.next_runs[0] ? ` · next automatic sync ${data.next_runs[0].slice(11, 16)}` : '';
    return { success: true, message: `${fresh}${data.sync_running ? ' · sync running now' : ''}${next}` };
  } catch (e) {
    console.error('garmin-api status failed', e);
    return { success: false, message: 'garmin-api is unreachable right now.' };
  }
}
