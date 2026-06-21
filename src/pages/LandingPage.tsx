import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Category, Product } from "../types";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { offlineMessage } from "../lib/errorHandling";
import Footer from "../components/Footer";
import Carousel from "../components/Carousel";
import ProductCard from "../components/ProductCard";
import CategoryTile from "../components/ui/CategoryTile";

interface LandingPageProps {
  onNavigate: (page: string) => void;
  setCategorySlug: (slug: string) => void;
}

export default function LandingPage({
  onNavigate,
  setCategorySlug,
}: LandingPageProps) {
  const { session } = useAuth();
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-app py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
              ShopHub
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
              Shopping made simple, fast, and worth coming back for.
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {!session && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate("login")}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("signup")}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

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

        <section className="mb-10 grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
          <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white shadow-xl dark:from-gray-950 dark:to-gray-900 md:p-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-gray-100">
              <CheckCircle2 size={16} />
              Welcome to a better way to shop online
            </div>

            <h2 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              Find products faster, shop with confidence, and enjoy a smoother
              checkout.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-200">
              ShopHub helps customers discover quality products, compare options
              easily, and order in a clean and reliable shopping experience.
              Whether you are browsing essentials or something new, everything
              is designed to be simple and useful.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate(session ? "home" : "signup")}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {session ? "Start Shopping" : "Create Account"}
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("landing-products")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Browse Products
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/40"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Latest / Trending slides */}
        <section className="mb-10">
          <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
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
        </section>

        <section className="mb-10">
          <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
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
        </section>

        <section className="mb-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Shop by Category
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                Explore what fits your needs
              </h2>
            </div>
            {categoriesQuery.isFetching && categories.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Refreshing...
              </span>
            )}
          </div>

          {categoriesQuery.isLoading && categories.length === 0 ? (
            <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
              Loading categories...
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {categories.map((category) => (
                <CategoryTile
                  key={category.id}
                  name={category.name}
                  image={isOnline ? category.image_url : null}
                  subtitle="View products"
                  onClick={() => handleCategoryFilter(category.slug)}
                />
              ))}
            </div>
          )}
        </section>

        <section
          id="landing-products"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/40 md:p-8"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Featured Products
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Browse what customers can order today
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300 md:text-base">
                Browse our latest active products, filter by category, and
                discover a faster path from browsing to checkout.
              </p>
            </div>

            {featuredProductsQuery.isFetching &&
              featuredProducts.length > 0 && (
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Refreshing products...
                </span>
              )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleCategoryFilter(null)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                !selectedCategorySlug
                  ? "bg-blue-600 text-white dark:bg-blue-700"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategoryFilter(category.slug)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  selectedCategorySlug === category.slug
                    ? "bg-blue-600 text-white dark:bg-blue-700"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {featuredProductsQuery.isLoading && featuredProducts.length === 0 ? (
            <div className="mt-8 rounded-lg bg-gray-50 p-6 text-sm text-gray-500 dark:bg-gray-900/40 dark:text-gray-300">
              Loading products...
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="mt-8 rounded-lg bg-gray-50 p-6 text-sm text-gray-500 dark:bg-gray-900/40 dark:text-gray-300">
              No products found for this category yet.
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
