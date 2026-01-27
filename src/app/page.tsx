
import React from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Activity, Bike, Waves, Zap, TrendingUp, Calendar, 
  Clock, Trophy, ChevronRight, MoreHorizontal, User,
  LayoutDashboard, BarChart3, Settings, LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import TrainingPlan from '@/components/TrainingPlan';

// --- Types ---
type TrainingActivity = {
  activity_id: number;
  name: string;
  type: string;
  start_time: string;
  distance: number;
  duration: number;
  calories: number;
};

// --- Helper Functions ---
function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function getActivityColor(type: string) {
  const t = type.toLowerCase();
  if (t.includes('cycling') || t.includes('cycling')) return 'text-blue-500 bg-blue-50 border-blue-100';
  if (t.includes('running')) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
  if (t.includes('swimming')) return 'text-cyan-500 bg-cyan-50 border-cyan-100';
  if (t.includes('strength')) return 'text-rose-500 bg-rose-50 border-rose-100';
  return 'text-slate-500 bg-slate-50 border-slate-100';
}

function getActivityIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes('cycling')) return <Bike className="w-5 h-5" />;
  if (t.includes('running')) return <Activity className="w-5 h-5" />;
  if (t.includes('swimming')) return <Waves className="w-5 h-5" />;
  if (t.includes('strength')) return <Zap className="w-5 h-5" />;
  return <Activity className="w-5 h-5" />;
}

// --- Components ---

const Sidebar = () => (
  <div className="hidden lg:flex flex-col w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white p-6">
    <div className="flex items-center gap-3 mb-10">
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg">
        S
      </div>
      <div>
        <h1 className="font-bold text-lg leading-tight">Smiters</h1>
        <p className="text-slate-400 text-xs">Coach AI</p>
      </div>
    </div>

    <nav className="space-y-2 flex-1">
      <a href="#" className="flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-400 rounded-xl font-medium border border-indigo-500/20">
        <LayoutDashboard className="w-5 h-5" />
        Dashboard
      </a>
      <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
        <Calendar className="w-5 h-5" />
        Schedule
      </a>
      <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
        <BarChart3 className="w-5 h-5" />
        Analytics
      </a>
      <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
        <Settings className="w-5 h-5" />
        Settings
      </a>
    </nav>

    <div className="mt-auto pt-6 border-t border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
          <User className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Nicnac</p>
          <p className="text-xs text-slate-500">Pro Athlete</p>
        </div>
        <LogOut className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" />
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, sub, icon, trend }: { title: string, value: string, sub: string, icon: React.ReactNode, trend?: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
        {icon}
      </div>
      {trend && (
        <span className="text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-slate-400 text-xs mt-1">{sub}</p>
    </div>
  </div>
);

const ActivityRow = ({ activity }: { activity: TrainingActivity }) => (
  <div className="group flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl border ${getActivityColor(activity.type)}`}>
        {getActivityIcon(activity.type)}
      </div>
      <div>
        <h4 className="font-semibold text-slate-900">{activity.name}</h4>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(activity.start_time), 'MMM d')}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(activity.start_time), 'HH:mm')}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-8">
      <div className="text-right hidden sm:block">
        <p className="font-bold text-slate-900">{(activity.distance / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-500">km</span></p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="font-medium text-slate-900">{formatDuration(activity.duration)}</p>
      </div>
      <div className="text-right hidden md:block">
        <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
          {Math.round(activity.calories || 0)} kcal
        </span>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
    </div>
  </div>
);

// --- Data Fetching ---
async function getActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('start_time', { ascending: false })
    .limit(7); // Just the last week for the list

  if (error) return [];
  return data as TrainingActivity[];
}

// --- Main Page ---
export default async function Home() {
  const activities = await getActivities();
  
  // Calculate totals
  const totalDist = activities.reduce((acc, curr) => acc + (curr.distance || 0), 0) / 1000;
  const totalTime = activities.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  
  // Mock Chart Data
  const chartData = [
    { name: 'Mon', dist: 12 },
    { name: 'Tue', dist: 45 },
    { name: 'Wed', dist: 0 },
    { name: 'Thu', dist: 25 },
    { name: 'Fri', dist: 8 },
    { name: 'Sat', dist: 120 },
    { name: 'Sun', dist: 15 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      
      <main className="lg:ml-64 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Training Overview</h1>
              <p className="text-slate-500 mt-1">Track your progress towards <span className="font-semibold text-indigo-600">The Ascend XTri</span></p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Sync Garmin
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                + Add Session
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Weekly Distance" 
              value={`${totalDist.toFixed(1)} km`} 
              sub="Total volume"
              icon={<Trophy className="w-6 h-6 text-orange-500" />}
              trend="+12%"
            />
            <StatCard 
              title="Training Time" 
              value={formatDuration(totalTime)} 
              sub="Active hours"
              icon={<Clock className="w-6 h-6 text-blue-500" />}
            />
            <StatCard 
              title="Recovery Status" 
              value="92%" 
              sub="Ready to train"
              icon={<Zap className="w-6 h-6 text-green-500" />}
            />
            <StatCard 
              title="Next Race" 
              value="104 Days" 
              sub="Swimrun Verdon"
              icon={<Calendar className="w-6 h-6 text-purple-500" />}
            />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Activity Feed */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-900">Recent Activities</h3>
                  <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">View All</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {activities.map(activity => (
                    <ActivityRow key={activity.activity_id} activity={activity} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Insights & Plan */}
            <div className="space-y-6">
              
              {/* Weekly Load Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg text-slate-900 mb-6">Weekly Load</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 12}} 
                        dy={10}
                      />
                      <Tooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      />
                      <Bar dataKey="dist" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.dist > 100 ? '#4f46e5' : '#cbd5e1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Insight Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Zap className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Coach's Focus</h4>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                      "Great volume on the bike yesterday. Today is a <b>Recovery Day</b>. 
                      Keep the heart rate below 130bpm. Focus on hydration for tomorrow's hill reps."
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Training Plan */}
              <TrainingPlan />

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
