import { createContext } from "react";
import type { Toast } from "./ToastProvider";

export interface ToastContextValue {
  show: (
    message: string,
    opts?: Partial<Omit<Toast, "id" | "message">>,
  ) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
