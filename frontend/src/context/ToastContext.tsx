import { createContext, useContext, useState, useCallback } from "react";
import type { AlertColor } from "@mui/material";

type ToastState = {
  open: boolean;
  message: string;
  severity: AlertColor;
};

type ToastContextType = {
  showToast: (msg: string, severity?: AlertColor) => void;
  hideToast: () => void;
  toast: ToastState;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showToast = useCallback(
    (message: string, severity: AlertColor = "info") => {
      setToast({ open: true, message, severity });
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToast((t) => ({ ...t, open: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
