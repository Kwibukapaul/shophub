import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ShopFiltersState {
  selectedStoreId: string | null;
  selectedCategorySlug: string | null;
  searchTerm: string;
  setSelectedStoreId: (storeId: string | null) => void;
  setSelectedCategorySlug: (slug: string | null) => void;
  setSearchTerm: (value: string) => void;
  clearShopFilters: () => void;
}

const initialState = {
  selectedStoreId: null,
  selectedCategorySlug: null,
  searchTerm: "",
};

export const useShopFiltersStore = create<ShopFiltersState>()(
  persist(
    (set) => ({
      ...initialState,
      setSelectedStoreId: (selectedStoreId) => set({ selectedStoreId }),
      setSelectedCategorySlug: (selectedCategorySlug) =>
        set({ selectedCategorySlug }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      clearShopFilters: () => set(initialState),
    }),
    {
      name: "shophub-shop-filters",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
