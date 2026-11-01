
import React from 'react';
import { garmin, localToday, weekStart, type ApiActivity, type PeriodSummary, type Sport } from '@/lib/garmin-api';
import {
  Activity, Bike, Waves, Zap, TrendingUp, TrendingDown, Calendar,
  Clock, Trophy, ChevronRight, User,
  LayoutDashboard, BarChart3, Settings, LogOut
} from 'lucide-react';
import { addDays, format, parseISO, subDays } from 'date-fns';
import TrainingPlan from '@/components/TrainingPlan';
import WeeklyLoadChart from '@/components/WeeklyLoadChart';
import SyncGarminButton from '@/components/SyncGarminButton';

// Data comes from garmin-api per request (its answers are cached 5 min by fetch), never at build time.
export const dynamic = 'force-dynamic';

// --- Helper Functions ---
function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

// `sport` is garmin-api's grouping of Garmin's ~100 activity types (road_biking, indoor_cycling... -> bike)
function getActivityColor(sport: Sport) {
  if (sport === 'bike') return 'text-blue-500 bg-blue-50 border-blue-100';
  if (sport === 'run') return 'text-emerald-500 bg-emerald-50 border-emerald-100';
  if (sport === 'swim') return 'text-cyan-500 bg-cyan-50 border-cyan-100';
  if (sport === 'strength') return 'text-rose-500 bg-rose-50 border-rose-100';
  return 'text-slate-500 bg-slate-50 border-slate-100';
}

function getActivityIcon(sport: Sport) {
  if (sport === 'bike') return <Bike className="w-5 h-5" />;
  if (sport === 'run') return <Activity className="w-5 h-5" />;
  if (sport === 'swim') return <Waves className="w-5 h-5" />;
  if (sport === 'strength') return <Zap className="w-5 h-5" />;
  return <Activity className="w-5 h-5" />;
}

const READINESS_LABEL: Record<string, string> = { PRIME: 'Prime', HIGH: 'High', MODERATE: 'Moderate', LOW: 'Low', POOR: 'Poor' };

// --- Components ---
const Sidebar = () => (
  <aside className="hidden lg:flex flex-col w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white p-6 z-50">
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
  </aside>
);

const StatCard = ({ title, value, sub, icon, trend }: { title: string, value: string, sub: string, icon: React.ReactNode, trend?: { label: string, up: boolean } }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${trend.up ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
          {trend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {trend.label}
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

const ActivityRow = ({ activity }: { activity: ApiActivity }) => (
  <div className="group flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <div className={`p-3 rounded-xl border flex-shrink-0 ${getActivityColor(activity.sport)}`}>
        {getActivityIcon(activity.sport)}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-slate-900 truncate">{activity.name}</h4>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
          {/* start_time_local is the wall clock where it happened, so it is displayed as is */}
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(parseISO(activity.start_time_local), 'MMM d')}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(parseISO(activity.start_time_local), 'HH:mm')}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-6 ml-4">
      <div className="text-right hidden sm:block">
        <p className="font-bold text-slate-900 whitespace-nowrap">{((activity.distance_m ?? 0) / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-500">km</span></p>
      </div>
      <div className="text-right hidden md:block">
        <p className="font-medium text-slate-900 whitespace-nowrap">{formatDuration(activity.duration_s ?? 0)}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
    </div>
  </div>
);

// --- Data Fetching ---
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ymd = (d: Date) => format(d, 'yyyy-MM-dd');

async function getDashboard() {
  const today = localToday();
  const monday = weekStart(today);
  try {
    const [snap, thisWeek, lastWeek] = await Promise.all([
      garmin.snapshot({ days: 1, activities: 7, weeks: 0 }), // latest readiness + the 7 most recent activities
      garmin.summary({ group: 'day', from: monday, to: today }), // this week, per day
      garmin.summary({ group: 'day', from: ymd(subDays(parseISO(monday), 7)), to: ymd(subDays(parseISO(monday), 1)) }), // last week, per day
    ]);
    return { snap: snap.data, thisWeek: thisWeek.data, lastWeek: lastWeek.data, error: false };
  } catch (e) {
    // Show an explicit notice rather than stale or made-up numbers
    console.error('garmin-api unavailable', e);
    return { snap: null, thisWeek: [] as PeriodSummary[], lastWeek: [] as PeriodSummary[], error: true };
  }
}

// --- Main Page ---
export default async function Home() {
  const { snap, thisWeek, lastWeek, error } = await getDashboard();
  const activities = snap?.recent_activities ?? [];

  const today = localToday();
  const monday = parseISO(weekStart(today));
  const weekDays = DAY_NAMES.map((name, i) => ({ name, date: ymd(addDays(monday, i)) }));
  const thisByDay = new Map(thisWeek.map(p => [p.period, p.totals]));
  const lastByDay = new Map(lastWeek.map(p => [p.period, p.totals]));

  // Real distance per day of the current week (km); the chart highlights the 100 km+ days
  const chartData = weekDays.map(d => ({ name: d.name, dist: Math.round((thisByDay.get(d.date)?.distance_m ?? 0) / 100) / 10 }));

  const elapsed = weekDays.filter(d => d.date <= today); // Monday .. today
  const totalDist = elapsed.reduce((acc, d) => acc + (thisByDay.get(d.date)?.distance_m ?? 0), 0) / 1000;
  const totalTime = elapsed.reduce((acc, d) => acc + (thisByDay.get(d.date)?.duration_s ?? 0), 0);

  // Trend = this week so far vs the same weekdays last week (a full last week would always make Monday look like a drop)
  const lastDist = elapsed.reduce((acc, d) => acc + (lastByDay.get(ymd(subDays(parseISO(d.date), 7)))?.distance_m ?? 0), 0) / 1000;
  const pct = lastDist > 0 ? Math.round(((totalDist - lastDist) / lastDist) * 100) : null;
  const distTrend = pct === null ? undefined : { label: `${pct >= 0 ? '+' : ''}${pct}%`, up: pct >= 0 };

  const readiness = snap?.latest.readiness_score ?? null;
  const readinessLevel = snap?.latest.readiness_level ?? null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="lg:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Training Overview</h1>
              <p className="text-slate-500 mt-1">Track your progress towards <span className="font-semibold text-indigo-600">The Ascend XTri</span></p>
            </div>
            <div className="flex gap-3 items-start">
              <SyncGarminButton />
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                + Add Session
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm">
              Garmin data is unavailable right now (garmin-api did not answer). Nothing is shown rather than stale numbers.
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard
              title="Weekly Distance"
              value={`${totalDist.toFixed(1)} km`}
              sub="This week so far"
              icon={<Trophy className="w-6 h-6" />}
              trend={distTrend}
            />
            <StatCard
              title="Training Time"
              value={formatDuration(totalTime)}
              sub="Active hours this week"
              icon={<Clock className="w-6 h-6" />}
            />
            <StatCard
              title="Recovery Status"
              value={readiness !== null ? String(readiness) : '—'}
              sub={readinessLevel ? `Training readiness · ${READINESS_LABEL[readinessLevel] ?? readinessLevel}` : 'No readiness data yet'}
              icon={<Zap className="w-6 h-6" />}
            />
            <StatCard 
              title="Next Race" 
              value="104 Days" 
              sub="Swimrun Verdon"
              icon={<Calendar className="w-6 h-6" />}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Column: Activities (takes 2 cols on XL screens) */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center">
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

            {/* Right Column: Charts & Plans */}
            <div className="xl:col-span-1 space-y-6">
              
              {/* Weekly Load Chart */}
              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg text-slate-900 mb-4">Weekly Load</h3>
                <WeeklyLoadChart data={chartData} />
              </div>

              {/* AI Insight Card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm flex-shrink-0">
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
