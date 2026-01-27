
import { supabase } from '@/lib/supabase';
import { Activity, Dumbbell, Bike, Waves, Calendar, Clock, Trophy } from 'lucide-react';
import { format } from 'date-fns';

// Define the shape of our data
type TrainingActivity = {
  activity_id: number;
  name: string;
  type: string;
  start_time: string;
  distance: number;
  duration: number;
  calories: number;
};

async function getActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('start_time', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
  return data as TrainingActivity[];
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function getActivityIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes('cycling') || t.includes('cycling')) return <Bike className="w-5 h-5 text-blue-500" />;
  if (t.includes('running')) return <Activity className="w-5 h-5 text-green-500" />;
  if (t.includes('swimming')) return <Waves className="w-5 h-5 text-cyan-500" />;
  if (t.includes('strength')) return <Dumbbell className="w-5 h-5 text-red-500" />;
  return <Activity className="w-5 h-5 text-gray-500" />;
}

export default async function Home() {
  const activities = await getActivities();

  // Simple stats from the latest 20
  const totalDistance = activities.reduce((acc, curr) => acc + (curr.distance || 0), 0) / 1000;
  const totalTime = activities.reduce((acc, curr) => acc + (curr.duration || 0), 0);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training Dashboard</h1>
            <p className="text-gray-500">Welcome back, Coach.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Trophy className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Recent Distance</p>
                <p className="text-xl font-bold">{totalDistance.toFixed(1)} km</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Recent Time</p>
                <p className="text-xl font-bold">{formatDuration(totalTime)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <div key={activity.activity_id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 p-3 rounded-full group-hover:bg-white group-hover:shadow-sm transition-all">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{activity.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(activity.start_time), 'MMM d, yyyy @ HH:mm')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-right w-24">
                    <p className="font-medium text-gray-900">{(activity.distance / 1000).toFixed(2)} km</p>
                    <p className="text-gray-400 text-xs">Distance</p>
                  </div>
                  <div className="text-right w-24">
                    <p className="font-medium text-gray-900">{formatDuration(activity.duration)}</p>
                    <p className="text-gray-400 text-xs">Duration</p>
                  </div>
                  <div className="text-right w-24 hidden sm:block">
                    <p className="font-medium text-gray-900">{activity.calories || '-'}</p>
                    <p className="text-gray-400 text-xs">Calories</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
