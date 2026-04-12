import {
  ShoppingCart,
  User,
  LogOut,
  Moon,
  Sun,
  MoreHorizontal,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";
import { UserProfile, supabase } from "../lib/supabase";
import { useEffect, useState } from "react";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import { getOrderProgressPercent } from "../lib/orderProgress";
import { useCartStore } from "../stores/useCartStore";

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
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm dark:bg-gray-800">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-blue-600"
          >
            ShopHub
          </button>

          <div className="hidden items-center gap-4 md:flex">
            <button onClick={() => navigate("/")}>Home / Shop</button>

            <div className="relative">
              <button onClick={() => setCatOpen((open) => !open)}>
                Categories v
              </button>
              {catOpen && (
                <div className="absolute left-0 mt-2 min-w-48 rounded border bg-white p-2 shadow-md dark:bg-gray-800">
                  {categories.length === 0 && categoriesQuery.isLoading && (
                    <p className="px-3 py-2 text-sm text-gray-500">
                      Loading categories...
                    </p>
                  )}
                  {categories.length === 0 && categoriesQuery.error && (
                    <button
                      onClick={() => void categoriesQuery.refetch()}
                      className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Retry categories
                    </button>
                  )}
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setCatOpen(false);
                        navigate(`/category/${category.slug}`);
                      }}
                      className="block w-full px-3 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => navigate("/contact")}>Contact Us</button>
            <button onClick={() => navigate("/about")}>About</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cart")}
            aria-label="cart"
            className="relative"
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
              className="hidden items-center gap-2 rounded-full bg-gray-100 px-2 py-1 text-sm font-semibold dark:bg-gray-700 md:flex"
              title={`Latest order ${latestOrder.order_number}`}
            >
              <Package size={14} />
              <span>{latestOrder.order_number}</span>
              <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                {Math.round(getOrderProgressPercent(latestOrder.status))}%
              </span>
            </button>
          )}

          {session ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                aria-label="menu"
              >
                <MoreHorizontal />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded border bg-white p-2 shadow-md dark:bg-gray-800">
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
                    <p className="mt-2 border-t pt-2 text-xs text-gray-500">
                      Signed in as {userProfile.full_name}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/signup")}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
