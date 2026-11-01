'use client'

import { useState, useTransition } from 'react';
import { syncGarminData } from '@/app/actions';

// Garmin data is pulled into garmin-api automatically (4x/day) and this app only reads it, so the button
// reports how fresh the data is and when the next sync runs instead of starting one itself.
export default function SyncGarminButton() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await syncGarminData();
            setMessage(result.message);
          })
        }
        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-60"
      >
        {isPending ? 'Checking…' : 'Sync Garmin'}
      </button>
      {message && <p className="text-xs text-slate-500 max-w-xs text-right">{message}</p>}
    </div>
  );
}
