import {
  ShoppingCart,
  User,
  LogOut,
  Moon,
  Sun,
  MoreHorizontal,
  Package,
  Menu,
  X,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";
import { UserProfile, supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import { getOrderProgressPercent } from "../lib/orderProgress";
import { useCartStore } from "../stores/useCartStore";
import Badge from "./ui/Badge";

interface NavigationProps {
  userProfile?: UserProfile | null;
}

export default function Navigation({ userProfile }: NavigationProps) {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const itemCount = useCartStore((state) => state.itemCount);
  const syncCartCount = useCartStore((state) => state.syncCartCount);
  const clearCart = useCartStore((state) => state.clearCart);

  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const categoriesQuery = usePersistentQuery<any[]>({
    queryKey: "navigation-categories",
    staleTimeMs: 5 * 60 * 1000,
    fallbackError: "Unable to load categories.",
    initialData: [],
    fetcher: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
  const categories = categoriesQuery.data || [];

  const latestOrderQuery = usePersistentQuery<any | null>({
    queryKey: `navigation-latest-order:${session?.user.id || "guest"}`,
    enabled: Boolean(session?.user.id),
    staleTimeMs: 30 * 1000,
    fallbackError: "",
    initialData: null,
    fetcher: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      return (data && data[0]) || null;
    },
  });

  const latestOrder = latestOrderQuery.data;

  useEffect(() => {
    if (!session?.user.id) {
      clearCart();
      return;
    }

    void syncCartCount(session.user.id);
  }, [clearCart, session?.user.id, syncCartCount]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm dark:bg-gray-900">
      <div className="container-app flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white"
          >
            <Package className="text-brand" size={22} />
            <span>ShopHub</span>
          </button>

          <div className="hidden md:flex md:items-center md:gap-6">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-slate-600 dark:text-slate-300"
            >
              Home
            </button>

            <div className="relative">
              <button
                onClick={() => setCatOpen((open) => !open)}
                className="text-sm text-slate-600 dark:text-slate-300"
              >
                Categories
              </button>
              {catOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-md bg-white p-3 shadow-md dark:bg-gray-800">
                  {categories.length === 0 && categoriesQuery.isLoading && (
                    <p className="px-3 py-2 text-sm text-gray-500">
                      Loading categories...
                    </p>
                  )}
                  {categories.length === 0 && categoriesQuery.error && (
                    <button
                      onClick={() => void categoriesQuery.refetch()}
                      className="block w-full px-3 py-2 text-left text-sm text-red-600"
                    >
                      Retry categories
                    </button>
                  )}
                  <div className="grid grid-cols-1 gap-1">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setCatOpen(false);
                          navigate(`/category/${category.slug}`);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-gray-700"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 border-t pt-2">
                    <div className="flex items-center gap-2">
                      <Badge color="blue">Electronics</Badge>
                      <Badge color="pink">Fashion</Badge>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Quick links to our flagship categories.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/contact")}
              className="text-sm text-slate-600 dark:text-slate-300"
            >
              Contact
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-slate-600 dark:text-slate-300"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/about")}
              className="text-sm text-slate-600 dark:text-slate-300"
            >
              About
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <input
                placeholder="Search products..."
                className="rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none"
              />
              <Search
                className="absolute right-2 top-2 text-slate-500"
                size={16}
              />
            </div>
          </div>

          <button
            onClick={() => navigate("/cart")}
            aria-label="cart"
            className="relative p-2 rounded-md hover:bg-slate-50 dark:hover:bg-gray-800"
          >
            <ShoppingCart />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>

          {latestOrder && (
            <button
              onClick={() => navigate(`/orders/${latestOrder.id}`)}
              className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold dark:bg-gray-800 md:flex"
              title={`Latest order ${latestOrder.order_number}`}
            >
              <Package size={14} />
              <span>{latestOrder.order_number}</span>
              <span className="ml-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                {Math.round(getOrderProgressPercent(latestOrder.status))}%
              </span>
            </button>
          )}

          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="menu"
                className="p-2 rounded-md hover:bg-slate-50 dark:hover:bg-gray-800"
              >
                <MoreHorizontal />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-md bg-white p-2 shadow-md dark:bg-gray-800">
                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-2 px-2 py-2 text-left"
                  >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />} Theme
                  </button>

                  <button
                    onClick={() => navigate("/profile")}
                    className="flex w-full items-center gap-2 px-2 py-2 text-left"
                  >
                    <User size={16} /> Profile
                  </button>

                  <button
                    onClick={() => navigate("/orders")}
                    className="flex w-full items-center gap-2 px-2 py-2 text-left"
                  >
                    <Package size={16} /> Orders
                  </button>

                  <button
                    onClick={() => navigate("/settings")}
                    className="flex w-full items-center gap-2 px-2 py-2 text-left"
                  >
                    Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-2 py-2 text-left"
                  >
                    <LogOut size={16} /> Logout
                  </button>

                  {userProfile?.full_name && (
                    <p className="mt-2 border-t pt-2 text-xs text-slate-500">
                      Signed in as {userProfile.full_name}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-slate-600 dark:text-slate-300"
              >
                Login
              </button>
              <button onClick={() => navigate("/signup")} className="btn">
                Sign Up
              </button>
            </div>
          )}

          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="p-2 rounded-md hover:bg-slate-50 dark:hover:bg-gray-800"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
