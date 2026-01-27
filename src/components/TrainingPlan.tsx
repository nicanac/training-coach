
'use client'

import { useState, useEffect, useTransition } from 'react';
import { generateTrainingPlan, DailyPlan, syncGarminData } from '@/app/actions';
import { Card } from '@/components/ui/card';
import { Loader2, RefreshCw, ChevronRight } from 'lucide-react';

export default function TrainingPlan() {
  const [plan, setPlan] = useState<DailyPlan[] | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load plan on mount (useEffect, not during render)
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = () => {
    startTransition(async () => {
      const data = await generateTrainingPlan();
      setPlan(data);
    });
  };

  const handleSync = () => {
    alert("Triggering Garmin Sync... (This runs in background)");
    syncGarminData();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-slate-900">Recommended Plan (Next 7 Days)</h3>
        <button 
            onClick={handleGenerate}
            disabled={isPending}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
        </button>
      </div>

      <div className="space-y-4">
        {isPending && <div className="text-center py-8 text-slate-400">Analyzing fatigue & race goals...</div>}
        
        {!isPending && !plan && <div className="text-center py-8 text-slate-400">Loading plan...</div>}
        
        {plan?.map((day, i) => (
          <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all bg-slate-50/50 hover:bg-white">
            <div className="w-16 flex-shrink-0 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{day.dayName.substring(0, 3)}</p>
                <p className="text-lg font-bold text-slate-900">{day.date.split('-')[2]}</p>
            </div>
            
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800">{day.activityType}</h4>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        day.intensity === 'High' ? 'bg-orange-100 text-orange-700' :
                        day.intensity === 'Low' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {day.intensity}
                    </span>
                </div>
                <p className="text-sm text-slate-600 font-medium">{day.focus}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">💡 {day.reasoning}</p>
            </div>

            <div className="text-right w-16">
                {day.durationMin > 0 ? (
                    <span className="text-sm font-bold text-slate-700">{Math.floor(day.durationMin / 60)}h {day.durationMin % 60}m</span>
                ) : (
                    <span className="text-sm font-bold text-slate-300">-</span>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
