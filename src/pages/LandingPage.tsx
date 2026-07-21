import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Category, Product } from "../types";
import { Moon, ShieldCheck, Sparkles, Sun, Truck } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { offlineMessage } from "../lib/errorHandling";
import Footer from "../components/Footer";
import Carousel from "../components/Carousel";
import { HeroSection, ProductGridSection } from "../components/sections";
import FeatureCard from "../components/sections/FeatureCard";
import CategoryTile from "../components/ui/CategoryTile";
import { motion } from "framer-motion";
import {
  staggerContainerVariants,
  staggerItemVariants,
} from "../lib/animationPresets";

interface LandingPageProps {
  onNavigate: (page: string) => void;
  setCategorySlug: (slug: string) => void;
}

export default function LandingPage({
  onNavigate,
  setCategorySlug,
}: LandingPageProps) {
  const { session } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<
    string | null
  >(null);

  const categoriesQuery = usePersistentQuery<Category[]>({
    queryKey: "homepage-categories",
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

  const featuredProductsQuery = usePersistentQuery<Product[]>({
    queryKey: `homepage-products:${selectedCategorySlug || "all"}`,
    staleTimeMs: 60 * 1000,
    fallbackError: "Unable to load products.",
    initialData: [],
    fetcher: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (selectedCategorySlug) {
        const { data: category, error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", selectedCategorySlug)
          .maybeSingle();

        if (categoryError) {
          throw categoryError;
        }

        if (!category) {
          return [];
        }

        query = query.eq("category_id", category.id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    },
  });

  const categories = categoriesQuery.data || [];
  const visibleCategories = categories.filter(
    (category) =>
      String(category.slug || "").toLowerCase() !== "fashion" &&
      String(category.name || "").toLowerCase() !== "fashion",
  );
  const featuredProducts = featuredProductsQuery.data || [];

  const benefits = [
    {
      title: "Trusted quality",
      description:
        "Discover carefully listed products with clear pricing and dependable service.",
      icon: ShieldCheck,
    },
    {
      title: "Fast ordering",
      description:
        "Find what you need quickly and move from browsing to checkout in just a few clicks.",
      icon: Truck,
    },
    {
      title: "Fresh variety",
      description:
        "Explore new arrivals and exciting categories without getting lost in clutter.",
      icon: Sparkles,
    },
  ];

  const handleCategoryFilter = (slug: string | null) => {
    setSelectedCategorySlug(slug);

    if (slug) {
      setCategorySlug(slug);
    }
  };

  // Product view and add-to-cart logic is handled inside `ProductCard`.

  const retryAll = () => {
    void categoriesQuery.refetch();
    void featuredProductsQuery.refetch();
  };

  const pageError =
    (!isOnline ? offlineMessage : null) ||
    categoriesQuery.error ||
    (featuredProducts.length === 0 ? featuredProductsQuery.error : null);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_45%),linear-gradient(180deg,_#faf7f2_0%,_#f5efe7_100%)] dark:bg-gray-900">
      <div className="container-app py-6 sm:py-8">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-medium text-stone-900 shadow-sm backdrop-blur transition hover:bg-stone-100 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-white dark:hover:bg-neutral-700"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>
        {/* Hero Section */}
        <HeroSection
          isAuthenticated={!!session}
          onStartShopping={() => {
            if (session) {
              onNavigate("home");
            } else {
              onNavigate("signup");
            }
          }}
          onBrowseProducts={() => {
            const element = document.getElementById("featured-products");
            element?.scrollIntoView({ behavior: "smooth" });
          }}
          onSignIn={() => onNavigate("login")}
          onSignUp={() => onNavigate("signup")}
        />

        {pageError && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <span>{pageError}</span>
            <button
              type="button"
              onClick={retryAll}
              className="rounded-lg border border-red-300 px-4 py-1.5 font-medium transition hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* Benefits Section */}
        <motion.section
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16"
        >
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
              Why ShopHub?
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Shop smarter, faster, better
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={benefit.title}
                variants={staggerItemVariants}
                transition={{ delay: idx * 0.1 }}
              >
                <FeatureCard
                  title={benefit.title}
                  description={benefit.description}
                  icon={benefit.icon}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Latest arrivals carousel */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="mb-6 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Latest arrivals
          </h3>
          <Carousel
            items={featuredProducts.slice(0, 6).map((p) => ({
              id: p.id,
              image: p.image_urls?.[0] || "/",
              title: p.name,
              subtitle: `RWF ${p.price.toLocaleString()}`,
            }))}
          />
        </motion.section>

        {/* Trending products carousel */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="mb-6 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Trending products
          </h3>
          <Carousel
            items={featuredProducts.slice(0, 6).map((p) => ({
              id: `trend-${p.id}`,
              image: p.image_urls?.[0] || "/",
              title: p.name,
              subtitle: `Popular — RWF ${p.price.toLocaleString()}`,
            }))}
          />
        </motion.section>

        {/* Browse by Category Section */}
        <motion.section
          className="mb-16"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={staggerItemVariants} className="mb-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400">
                  Shop by Category
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-white md:text-4xl">
                  Explore what fits your needs
                </h2>
              </div>
              {categoriesQuery.isFetching && categories.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Refreshing...
                </span>
              )}
            </div>
          </motion.div>

          {categoriesQuery.isLoading && categories.length === 0 ? (
            <motion.div
              variants={staggerItemVariants}
              className="rounded-lg bg-white dark:bg-gray-800 p-6 text-sm text-gray-500 dark:text-gray-300 shadow"
            >
              Loading categories...
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6 md:grid-cols-2"
            >
              {visibleCategories.map((category, idx) => (
                <motion.div
                  key={category.id}
                  variants={staggerItemVariants}
                  transition={{ delay: idx * 0.05 }}
                >
                  <CategoryTile
                    name={category.name}
                    image={isOnline ? category.image_url : null}
                    subtitle="View products"
                    onClick={() => handleCategoryFilter(category.slug)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* Featured Products Grid */}
        <motion.div
          id="featured-products"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <ProductGridSection
            title="Browse what customers can order today"
            subtitle="Browse our latest active products, filter by category, and discover a faster path from browsing to checkout."
            products={featuredProducts}
            categories={categories}
            isLoading={featuredProductsQuery.isLoading}
            selectedCategory={selectedCategorySlug}
            onCategoryChange={handleCategoryFilter}
            showCategoryFilter={true}
          />
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
