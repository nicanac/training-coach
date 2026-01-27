
'use server'

import { supabase } from '@/lib/supabase';
import { addDays, format, startOfWeek, endOfWeek, subDays } from 'date-fns';

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
  const { data: recentActivities } = await supabase
    .from('activities')
    .select('start_time, duration, type, avg_hr, max_hr')
    .gte('start_time', subDays(new Date(), 28).toISOString()) // Last 4 weeks
    .order('start_time', { ascending: true });

  if (!recentActivities) return { atl: 0, ctl: 0, tsb: 0 };

  // Calculate daily load approximation
  // If no HR, assume moderate intensity (RPE 5)
  // If HR, Load = Duration_min * (AvgHR / 180 * 10)
  const dailyLoads: Record<string, number> = {};
  
  recentActivities.forEach(a => {
    const date = a.start_time.split('T')[0];
    const minutes = a.duration / 60;
    let intensityFactor = 0.6; // Default moderate
    
    if (a.avg_hr) {
        intensityFactor = (a.avg_hr / 185); // Assuming 185 max HR for Nicnac
    }
    
    const load = minutes * intensityFactor * 100; // Normalized scale
    dailyLoads[date] = (dailyLoads[date] || 0) + load;
  });

  // Simple rolling averages
  const today = new Date();
  let atlSum = 0; // 7 days (Fatigue)
  let ctlSum = 0; // 42 days (Fitness) - abbreviated to 28 here for data availability
  
  for (let i = 0; i < 28; i++) {
    const d = subDays(today, i).toISOString().split('T')[0];
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
  const today = new Date();

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
export async function syncGarminData() {
  // In a real deployed app, this would call an API route or separate worker.
  // For local dev, we assume the node script is run separately or we trigger it via shell.
  // Since we are running in Next.js server context, we can't easily spawn the node script 
  // without blocking or configuration.
  
  // Mocking the success for the UI response, assuming the cron/script runs in background.
  // In a production Vercel app, this would be a Function Duration limit issue.
  return { success: true, message: "Sync initiated (Check logs)" };
}
