export type Role = "admin" | "store_manager" | "customer" | "unknown";

export function getDashboardForRole(role: string | null | undefined) {
  const r = String(role || "").toLowerCase();
  if (r === "admin") return "/admin";
  if (r === "store_manager") return "/store-manager";
  if (r === "customer") return "/";
  return "/login";
}

export function derivePermissions(role: string | null | undefined) {
  const r = String(role || "").toLowerCase();
  return {
    canManageUsers: r === "admin",
    canManageStores: r === "admin" || r === "store_manager",
    canManageProducts: r === "admin" || r === "store_manager",
    canManageOrders: r === "admin" || r === "store_manager",
    canManageCategories: r === "admin",
    canViewAnalytics: r === "admin",
    canPurchase: r === "customer",
    canCheckout: r === "customer",
  };
}
