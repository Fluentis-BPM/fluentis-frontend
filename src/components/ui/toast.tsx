import * as React from "react";
import { cn } from "@/lib/utils";

// Minimal, dependency-free toast types used by our custom hook
export type ToastProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "info" | "warning";
  // Optional extras used by callers; renderer may ignore
  duration?: number;
  action?: React.ReactNode;
};

export type ToastActionElement = React.ReactElement;

// Simple Toaster renderer. It expects the current list of toasts.
export function Toaster({ toasts }: { toasts: Array<ToastProps & { id: string }> }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-md border p-3 shadow-lg bg-card text-card-foreground",
            t.variant === "destructive" && "border-red-600/30 bg-red-600/10",
            t.variant === "success" && "border-green-600/30 bg-green-600/10",
            t.variant === "info" && "border-blue-600/30 bg-blue-600/10",
            t.variant === "warning" && "border-yellow-600/30 bg-yellow-600/10"
          )}
        >
          {t.title && <div className="text-sm font-semibold">{t.title}</div>}
          {t.description && <div className="text-sm opacity-90">{t.description}</div>}
          {t.action && <div className="mt-2">{t.action}</div>}
        </div>
      ))}
    </div>
  );
}
