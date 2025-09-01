import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ToastContext } from './toastContext';
import { createPortal } from 'react-dom';

export interface Toast {
  id: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number; // ms
}



export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.filter(to => to.id !== id));
    const handle = timeouts.current[id];
    if (handle) window.clearTimeout(handle);
    delete timeouts.current[id];
  }, []);

  const show = useCallback((message: string, opts: Partial<Omit<Toast,'id'|'message'>> = {}) => {
    const id = crypto.randomUUID();
    const toast: Toast = { id, message, type: opts.type || 'info', duration: opts.duration ?? 3500 };
    setToasts(t => [...t, toast]);
    if (toast.duration! > 0) {
      const handle = window.setTimeout(() => dismiss(id), toast.duration);
      timeouts.current[id] = handle;
    }
  }, [dismiss]);

  useEffect(() => () => { // cleanup on unmount
    Object.values(timeouts.current).forEach(h => window.clearTimeout(h));
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      {createPortal(
        <div className="fixed z-50 bottom-4 right-4 flex flex-col space-y-2 w-72">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`rounded shadow px-4 py-3 text-sm border flex items-start space-x-2 animate-fade-in-up bg-white
                ${t.type === 'success' ? 'border-green-300' : t.type === 'error' ? 'border-red-300' : t.type === 'warning' ? 'border-yellow-300' : 'border-gray-200'}`}
            >
              <div className="flex-1 text-gray-800">{t.message}</div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Dismiss"
              >×</button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// Basic fade-in animation (Tailwind can be extended; inline utility here)
// Add to global CSS if not present.