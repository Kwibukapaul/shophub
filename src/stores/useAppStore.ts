import { create } from "zustand";

interface AppStore {
  userId: string | null;
  userProfile: any | null;
  setUser: (id: string | null, profile?: any | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  userId: null,
  userProfile: null,
  setUser: (id, profile = null) => set({ userId: id, userProfile: profile }),
}));
