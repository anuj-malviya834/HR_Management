import React from 'react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  isDestructive,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) {
    const emptyElement = null;
    return emptyElement;
  }

  const confirmBtnClass = isDestructive
    ? 'px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded transition shadow-xs'
    : 'px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded transition shadow-xs';

  const element = (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-md border border-neutral-200 shadow-md max-w-md w-full p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded border border-neutral-200 transition"
          >
            Cancel
          </button>
          <button onClick={onConfirm} className={confirmBtnClass}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return element;
}
