import React, { useState, useCallback, useRef, useEffect } from "react";
import { ToastContext } from "./toastContext";
import { createPortal } from "react-dom";

export interface Toast {
  id: string;
  type?: "info" | "success" | "error" | "warning";
  message: string;
  duration?: number; // ms
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef<Record<string, number>>({});

  // Polyfill for crypto.randomUUID (older browsers / non-secure contexts)
  const safeRandomUUID = useCallback((): string => {
    const g = (
      typeof globalThis !== "undefined" ? globalThis : {}
    ) as typeof globalThis & { crypto?: Crypto };
    if (
      g.crypto &&
      "randomUUID" in g.crypto &&
      typeof (g.crypto as { randomUUID?: () => string }).randomUUID ===
        "function"
    ) {
      return g.crypto.randomUUID!();
    }
    // Fallback using crypto.getRandomValues if available
    const getValues = (size: number) => {
      if (g.crypto && typeof g.crypto.getRandomValues === "function") {
        return g.crypto.getRandomValues(new Uint8Array(size));
      }
      // Final fallback (not cryptographically strong)
      const arr = new Uint8Array(size);
      for (let i = 0; i < size; i++) arr[i] = Math.floor(Math.random() * 256);
      return arr;
    };
    const bytes = getValues(16);
    // RFC4122 version 4 formatting
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const toHex: string[] = [];
    for (let i = 0; i < 256; i++)
      toHex.push((i + 0x100).toString(16).substring(1));
    return (
      toHex[bytes[0]] +
      toHex[bytes[1]] +
      toHex[bytes[2]] +
      toHex[bytes[3]] +
      "-" +
      toHex[bytes[4]] +
      toHex[bytes[5]] +
      "-" +
      toHex[bytes[6]] +
      toHex[bytes[7]] +
      "-" +
      toHex[bytes[8]] +
      toHex[bytes[9]] +
      "-" +
      toHex[bytes[10]] +
      toHex[bytes[11]] +
      toHex[bytes[12]] +
      toHex[bytes[13]] +
      toHex[bytes[14]] +
      toHex[bytes[15]]
    );
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((to) => to.id !== id));
    const handle = timeouts.current[id];
    if (handle) window.clearTimeout(handle);
    delete timeouts.current[id];
  }, []);

  const show = useCallback(
    (message: string, opts: Partial<Omit<Toast, "id" | "message">> = {}) => {
      const id = safeRandomUUID();
      const toast: Toast = {
        id,
        message,
        type: opts.type || "info",
        duration: opts.duration ?? 3500,
      };
      setToasts((t) => [...t, toast]);
      if (toast.duration! > 0) {
        const handle = window.setTimeout(() => dismiss(id), toast.duration);
        timeouts.current[id] = handle;
      }
    },
    [dismiss, safeRandomUUID],
  );

  useEffect(
    () => () => {
      // cleanup on unmount
      Object.values(timeouts.current).forEach((h) => window.clearTimeout(h));
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      {createPortal(
        <div className="fixed z-50 bottom-4 right-4 flex flex-col space-y-2 w-72">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`rounded shadow px-4 py-3 text-sm border flex items-start space-x-2 animate-fade-in-up bg-white
                ${t.type === "success" ? "border-green-300" : t.type === "error" ? "border-red-300" : t.type === "warning" ? "border-yellow-300" : "border-gray-200"}`}
            >
              <div className="flex-1 text-gray-800">{t.message}</div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
};

// Basic fade-in animation (Tailwind can be extended; inline utility here)
// Add to global CSS if not present.
