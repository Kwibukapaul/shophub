import { create } from "zustand";
import { supabase } from "../lib/supabase";

interface CartQuantityRow {
  quantity: number;
}

interface CartStoreState {
  itemCount: number;
  isSyncing: boolean;
  setItemCount: (count: number) => void;
  adjustItemCount: (delta: number) => void;
  clearCart: () => void;
  syncCartCount: (userId: string) => Promise<void>;
}

export const useCartStore = create<CartStoreState>((set) => ({
  itemCount: 0,
  isSyncing: false,
  setItemCount: (count) =>
    set({
      itemCount: Math.max(0, count),
    }),
  adjustItemCount: (delta) =>
    set((state) => ({
      itemCount: Math.max(0, state.itemCount + delta),
    })),
  clearCart: () =>
    set({
      itemCount: 0,
      isSyncing: false,
    }),
  syncCartCount: async (userId) => {
    if (!userId) {
      set({ itemCount: 0, isSyncing: false });
      return;
    }

    set({ isSyncing: true });

    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("quantity")
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      const totalQuantity = ((data || []) as CartQuantityRow[]).reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      set({
        itemCount: totalQuantity,
        isSyncing: false,
      });
    } catch (error) {
      console.error("Failed to sync cart count:", error);
      set({ isSyncing: false });
    }
  },
}));
