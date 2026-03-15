"use client";

import {
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ToastType = 'success' | 'error' | 'info';

type ToastInput = {
  type: ToastType;
  message: string;
  duration?: number;
};

type ToastRecord = ToastInput & {
  id: string;
  dismissing: boolean;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

type PersistedToast = ToastInput & {
  storedAt: number;
};

const DEFAULT_DURATION = 4000;
const EXIT_DURATION = 220;
const STORAGE_KEY = 'app:pending-toast';

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_STYLES: Record<ToastType, { color: string; icon: typeof CheckCircle2 }> = {
  success: { color: '#22C55E', icon: CheckCircle2 },
  error: { color: '#EF4444', icon: XCircle },
  info: { color: '#2563EB', icon: Info },
};

function buildToastId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function persistToast(input: ToastInput): void {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: PersistedToast = {
    ...input,
    storedAt: Date.now(),
  };

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const removeTimersRef = useRef<Record<string, number>>({});
  const dismissTimersRef = useRef<Record<string, number>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) => (
      currentToasts.map((toastRecord) => (
        toastRecord.id === id ? { ...toastRecord, dismissing: true } : toastRecord
      ))
    ));

    if (removeTimersRef.current[id]) {
      window.clearTimeout(removeTimersRef.current[id]);
    }

    removeTimersRef.current[id] = window.setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((toastRecord) => toastRecord.id !== id));
      delete removeTimersRef.current[id];
      delete dismissTimersRef.current[id];
    }, EXIT_DURATION);
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const nextToast: ToastRecord = {
      ...input,
      duration: input.duration ?? DEFAULT_DURATION,
      id: buildToastId(),
      dismissing: false,
    };

    setToasts((currentToasts) => [...currentToasts, nextToast]);

    dismissTimersRef.current[nextToast.id] = window.setTimeout(() => {
      dismissToast(nextToast.id);
    }, nextToast.duration);
  }, [dismissToast]);

  useEffect(() => {
    const storedToast = window.sessionStorage.getItem(STORAGE_KEY);
    if (!storedToast) {
      return;
    }

    window.sessionStorage.removeItem(STORAGE_KEY);

    try {
      const parsedToast = JSON.parse(storedToast) as PersistedToast;
      if (parsedToast.message && Date.now() - parsedToast.storedAt < 15000) {
        toast(parsedToast);
      }
    } catch {
      // Ignore corrupted session storage state.
    }
  }, []);

  useEffect(() => () => {
    Object.values(dismissTimersRef.current).forEach((timer) => window.clearTimeout(timer));
    Object.values(removeTimersRef.current).forEach((timer) => window.clearTimeout(timer));
  }, []);

  const contextValue = useMemo<ToastContextValue>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
      >
        {toasts.map((toastRecord) => {
          const Icon = TOAST_STYLES[toastRecord.type].icon;
          const color = TOAST_STYLES[toastRecord.type].color;

          return (
            <div
              key={toastRecord.id}
              role="status"
              className={`pointer-events-auto overflow-hidden rounded-2xl border border-[#E3E8EE] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] ${
                toastRecord.dismissing ? 'animate-[toast-out_220ms_ease-in_forwards]' : 'animate-[toast-in_280ms_ease-out_forwards]'
              }`}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <div
                  className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}1A`, color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="flex-1 text-sm leading-6 text-[#0A2540]">{toastRecord.message}</p>
                <button
                  type="button"
                  onClick={() => dismissToast(toastRecord.id)}
                  className="rounded-full p-1 text-[#6B7C93] transition hover:bg-[#F6F9FC] hover:text-[#0A2540]"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="h-1 w-full bg-[#F6F9FC]">
                <div
                  className="h-full origin-left"
                  style={{
                    backgroundColor: color,
                    animation: toastRecord.dismissing
                      ? 'none'
                      : `toast-progress ${toastRecord.duration}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
