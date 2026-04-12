import type { ReactNode } from "react";
import { useCartStore } from "../stores/useCartStore";

export function CartProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const useCart = useCartStore;
