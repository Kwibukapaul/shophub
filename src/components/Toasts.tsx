import React, { useEffect } from "react";
import { useToastStore } from "../stores/useToastStore";

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
          className="max-w-sm cursor-pointer rounded-lg bg-white px-4 py-3 shadow-lg dark:bg-gray-800"
        >
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {t.message}
          </div>
        </div>
      ))}
    </div>
  );
}
