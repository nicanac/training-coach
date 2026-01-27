
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Bike, Waves, Zap, TrendingUp } from 'lucide-react';

// Reusing types roughly
type Activity = {
  type: string;
  distance: number;
  duration: number;
  start_time: string;
};

// Mock "AI" Plan for now - we will replace with real DB data later
const weeklyPlan = [
  { day: 'Monday', activity: 'Swim: Aerobic Endurance', distance: '2.5km', status: 'Done' },
  { day: 'Tuesday', activity: 'Bike: VO2 Max Intervals', distance: '1h 15m', status: 'Today' },
  { day: 'Wednesday', activity: 'Run: Hill Reps (XTri Prep)', distance: '12km', status: 'Upcoming' },
  { day: 'Thursday', activity: 'Swim: Technical Drills', distance: '2.0km', status: 'Upcoming' },
  { day: 'Friday', activity: 'Rest / Mobility', distance: '-', status: 'Upcoming' },
  { day: 'Saturday', activity: 'Long Ride (Z2)', distance: '4h 00m', status: 'Upcoming' },
  { day: 'Sunday', activity: 'Brick: Bike + Run', distance: '3h', status: 'Upcoming' },
];

export default function DashboardInsights({ activities }: { activities: Activity[] }) {
  // Calculate volumes
  const runDist = activities.filter(a => a.type === 'running' || a.type === 'trail_running').reduce((sum, a) => sum + (a.distance || 0), 0) / 1000;
  const bikeDist = activities.filter(a => a.type === 'cycling' || a.type === 'road_biking' || a.type === 'indoor_cycling').reduce((sum, a) => sum + (a.distance || 0), 0) / 1000;
  const swimDist = activities.filter(a => a.type === 'lap_swimming' || a.type === 'open_water_swimming').reduce((sum, a) => sum + (a.distance || 0), 0) / 1000;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Volume Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-1 md:col-span-2">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Volume Analysis (Last 20 Activities)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Bike className="w-4 h-4" /> Cycling
            </div>
            <p className="text-2xl font-bold text-gray-900">{bikeDist.toFixed(1)} <span className="text-sm font-normal text-gray-500">km</span></p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <Activity className="w-4 h-4" /> Running
            </div>
            <p className="text-2xl font-bold text-gray-900">{runDist.toFixed(1)} <span className="text-sm font-normal text-gray-500">km</span></p>
          </div>
          <div className="p-4 bg-cyan-50 rounded-lg">
            <div className="flex items-center gap-2 text-cyan-700 mb-1">
              <Waves className="w-4 h-4" /> Swimming
            </div>
            <p className="text-2xl font-bold text-gray-900">{swimDist.toFixed(1)} <span className="text-sm font-normal text-gray-500">km</span></p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            AI Coach Insight
          </h4>
          <p className="text-sm text-gray-600">
            "You've been crushing the <b>Swimming</b> volume lately! Great base for the Swimrun. 
            However, your <b>Running</b> volume is slightly low for the upcoming XTri. 
            Recommendation: Add one dedicated hill session this week."
          </p>
        </div>
      </div>

      {/* Weekly Plan */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">This Week's Plan</h3>
        <div className="space-y-3">
          {weeklyPlan.map((session, i) => (
            <div key={i} className="flex items-center justify-between text-sm pb-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-medium text-gray-700">{session.day}</p>
                <p className="text-gray-500 text-xs">{session.activity}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  session.status === 'Done' ? 'bg-green-100 text-green-700' :
                  session.status === 'Today' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {session.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
