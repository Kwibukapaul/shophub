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
  ChevronDown,
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
import StyledButton from "./ui/StyledButton";
import { motion, AnimatePresence } from "framer-motion";
import { dropdownVariants } from "../lib/animationPresets";

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
    <nav className="sticky top-0 z-50 border-b border-neutral-200/70 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90">
      <div className="container-app flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 rounded-full px-2 py-1 text-lg font-semibold text-slate-900 transition hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-white shadow-sm">
              <Package size={18} />
            </div>
            <span>ShopHub</span>
          </button>

          <div className="hidden md:flex md:items-center md:gap-2">
            <button
              onClick={() => navigate("/")}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-neutral-100 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-neutral-800 dark:hover:text-primary-400"
            >
              Home
            </button>

            <div className="relative group">
              <button
                onClick={() => setCatOpen((open) => !open)}
                className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-neutral-100 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-neutral-800 dark:hover:text-primary-400"
              >
                Categories
                <ChevronDown
                  size={16}
                  className={`transition-transform ${catOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute left-0 mt-2 w-72 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-4">
                      {categories.length === 0 && categoriesQuery.isLoading && (
                        <p className="px-3 py-2 text-sm text-gray-500">
                          Loading categories...
                        </p>
                      )}
                      {categories.length === 0 && categoriesQuery.error && (
                        <button
                          onClick={() => void categoriesQuery.refetch()}
                          className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                        >
                          Retry categories
                        </button>
                      )}
                      <div className="space-y-1">
                        {categories.map((category, idx) => (
                          <motion.button
                            key={category.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => {
                              setCatOpen(false);
                              navigate(`/category/${category.slug}`);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded transition"
                          >
                            {category.name}
                          </motion.button>
                        ))}
                      </div>
                      <motion.div
                        className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge color="blue">Electronics</Badge>
                          <Badge color="pink">Fashion</Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Quick access to featured categories
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => navigate("/contact")}
              className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Contact
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/about")}
              className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
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
                className="w-56 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-2 pl-10 text-sm shadow-sm outline-none transition focus:border-primary-500 focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:focus:bg-neutral-900"
              />
              <Search
                className="absolute left-3 top-2.5 text-slate-500"
                size={16}
              />
            </div>
          </div>

          <button
            onClick={() => navigate("/cart")}
            aria-label="cart"
            className="relative rounded-full p-2.5 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
              className="hidden items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 md:flex"
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
                className="rounded-full p-2.5 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <MoreHorizontal />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute right-0 mt-2 w-52 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                  >
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          toggleTheme();
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                      >
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        {isDark ? "Light Mode" : "Dark Mode"}
                      </button>

                      <button
                        onClick={() => {
                          navigate("/profile");
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                      >
                        <User size={16} /> Profile
                      </button>

                      <button
                        onClick={() => {
                          navigate("/orders");
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                      >
                        <Package size={16} /> Orders
                      </button>

                      <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

                      <button
                        onClick={() => {
                          handleLogout();
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                      >
                        <LogOut size={16} /> Logout
                      </button>

                      {userProfile?.full_name && (
                        <p className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-slate-500 dark:text-slate-400">
                          Signed in as{" "}
                          <span className="font-medium">
                            {userProfile.full_name}
                          </span>
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <StyledButton
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
              >
                Login
              </StyledButton>
              <StyledButton
                variant="primary"
                size="sm"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </StyledButton>
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
