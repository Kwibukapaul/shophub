import { useEffect } from "react";
import { useToastStore } from "../stores/useToastStore";
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function Toasts() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  useEffect(() => {
    const timers = toasts.map((t) => {
      const duration = t.duration ?? 5000;
      const id = setTimeout(() => remove(t.id), duration);
      return { id, toastId: t.id };
    });

    return () => timers.forEach((t) => clearTimeout(t.id));
  }, [toasts, remove]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => t.onClick?.()}
          className="max-w-sm cursor-pointer card flex items-start gap-3 p-3"
        >
          <div className="mt-1">
            {t.type === "success" ? (
              <CheckCircle className="text-green-500" />
            ) : t.type === "error" ? (
              <AlertTriangle className="text-red-500" />
            ) : (
              <Info className="text-slate-500" />
            )}
          </div>

          <div className="flex-1 text-sm text-slate-900 dark:text-slate-100">
            {t.message}
          </div>
        </div>
      ))}
    </div>
  );
}
