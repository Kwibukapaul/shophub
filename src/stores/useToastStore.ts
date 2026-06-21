import { create } from "zustand";

export type Toast = {
  id: string;
  message: string;
  createdAt: number;
  duration?: number;
  onClick?: () => void;
  type?: "success" | "error" | "info";
};

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, "createdAt">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) =>
    set((s) => ({ toasts: [...s.toasts, { ...t, createdAt: Date.now() }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
