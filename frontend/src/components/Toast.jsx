import React from 'react';

export default function Toast({ message, isVisible }) {
  const visibilityClass = isVisible
    ? 'translate-y-0 opacity-100'
    : 'translate-y-12 opacity-0 pointer-events-none';

  const element = (
    <div
      className={`fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-3.5 py-2 rounded shadow-md text-xs font-medium flex items-center gap-2 transform transition-all duration-200 ${visibilityClass}`}
    >
      <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>{message}</span>
    </div>
  );

  return element;
}
