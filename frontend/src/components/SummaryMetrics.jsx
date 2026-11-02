import React from 'react';

const zeroPercent = 0;

export default function SummaryMetrics({ metrics }) {
  const total = metrics?.total ?? zeroPercent;
  const present = metrics?.present ?? zeroPercent;
  const presentPercent = metrics?.present_percent ?? zeroPercent;
  const absent = metrics?.absent ?? zeroPercent;
  const absentPercent = metrics?.absent_percent ?? zeroPercent;
  const unmarked = metrics?.unmarked ?? zeroPercent;
  const unmarkedPercent = metrics?.unmarked_percent ?? zeroPercent;

  const element = (
    <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md p-3 shadow-xs transition-colors duration-150">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:divide-neutral-800">
        <div className="px-4 py-2 sm:py-0">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Total Staff</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">{total}</span>
            <span className="text-xs text-neutral-400 font-normal">employees</span>
          </div>
        </div>

        <div className="px-4 py-2 sm:py-0">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Present</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">{present}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{presentPercent}%</span>
          </div>
        </div>

        <div className="px-4 py-2 sm:py-0">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Absent</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">{absent}</span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">{absentPercent}%</span>
          </div>
        </div>

        <div className="px-4 py-2 sm:py-0">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
            <span>Not Marked</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">{unmarked}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{unmarkedPercent}%</span>
          </div>
        </div>
      </div>
    </section>
  );

  return element;
}
