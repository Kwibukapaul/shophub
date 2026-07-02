import { supabase } from "../lib/supabase";
import { Category, Product } from "../types";
import { Search } from "lucide-react";
import ProductCard from "../components/ProductCard";
import CategoryTile from "../components/ui/CategoryTile";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { offlineMessage } from "../lib/errorHandling";
import { useShopFiltersStore } from "../stores/useShopFiltersStore";
import { motion } from "framer-motion";
import {
  staggerContainerVariants,
  staggerItemVariants,
} from "../lib/animationPresets";
import StyledButton from "../components/ui/StyledButton";
import StyledCard from "../components/ui/StyledCard";

interface HomePageProps {
  setCategorySlug: (slug: string) => void;
}

export default function HomePage({ setCategorySlug }: HomePageProps) {
  const isOnline = useOnlineStatus();

  const selectedStoreId = useShopFiltersStore((state) => state.selectedStoreId);
  const selectedCategorySlug = useShopFiltersStore(
    (state) => state.selectedCategorySlug,
  );
  const searchTerm = useShopFiltersStore((state) => state.searchTerm);
  const setSelectedStoreId = useShopFiltersStore(
    (state) => state.setSelectedStoreId,
  );
  const setSelectedCategorySlug = useShopFiltersStore(
    (state) => state.setSelectedCategorySlug,
  );
  const setSearchTerm = useShopFiltersStore((state) => state.setSearchTerm);

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

  const partnerStoresQuery = usePersistentQuery<any[]>({
    queryKey: "homepage-partner-stores",
    staleTimeMs: 5 * 60 * 1000,
    fallbackError: "Unable to load partner stores.",
    initialData: [],
    fetcher: async () => {
      const { data, error } = await supabase
        .from("partner_stores")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        throw error;
      }

      return data || [];
    },
  });

  const featuredProductsQuery = usePersistentQuery<Product[]>({
    queryKey: `homepage-products:${selectedStoreId || "all"}:${selectedCategorySlug || "all"}`,
    staleTimeMs: 60 * 1000,
    fallbackError: "Unable to load products.",
    initialData: [],
    fetcher: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (selectedStoreId) {
        query = query.eq("partner_store_id", selectedStoreId);
      }

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
  const partnerStores = partnerStoresQuery.data || [];
  const featuredProducts = featuredProductsQuery.data || [];
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredProducts = featuredProducts.filter((product) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    const searchableText = [
      product.name,
      product.description,
      product.long_description,
      product.sku,
      product.slug,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearchTerm);
  });

  const handleCategoryClick = (slug: string) => {
    setSelectedCategorySlug(slug);
    setCategorySlug(slug);
  };

  // product view / add-to-cart handlers are not used here; handled in ProductCard

  const retryAll = () => {
    void categoriesQuery.refetch();
    void partnerStoresQuery.refetch();
    void featuredProductsQuery.refetch();
  };

  const pageError =
    (!isOnline ? offlineMessage : null) ||
    categoriesQuery.error ||
    partnerStoresQuery.error ||
    (featuredProducts.length === 0 ? featuredProductsQuery.error : null);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_45%),linear-gradient(180deg,_#faf7f2_0%,_#f5efe7_100%)] dark:bg-gray-900">
      <div className="container-app py-12">
        {pageError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
          >
            <span>{pageError}</span>
            <button
              type="button"
              onClick={retryAll}
              className="rounded-lg border border-red-300 px-3 py-1 font-medium hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900/30"
            >
              Retry
            </button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-[28px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur dark:border-neutral-700 dark:bg-neutral-800/80"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
                Customer home
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-white">
                Shop thoughtfully, from one calm space
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-7 text-stone-600 dark:text-stone-400">
              Discover the best of our partner stores with curated categories,
              polished product stories, and a smooth path to checkout.
            </p>
          </div>
        </motion.div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden w-64 md:block"
          >
            <StyledCard
              variant="default"
              className="h-full rounded-[24px] border border-stone-200 bg-white/85 p-6 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)] dark:border-neutral-700 dark:bg-neutral-800/85"
            >
              <h3 className="mb-6 text-lg font-semibold text-stone-900 dark:text-white">
                Partner Stores
              </h3>
              <nav className="flex-1 space-y-2 mb-8">
                <StyledButton
                  variant={!selectedStoreId ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStoreId(null)}
                  className="w-full justify-start"
                >
                  All Stores
                </StyledButton>

                <motion.div
                  variants={staggerContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {partnerStores.map((store) => (
                    <motion.div key={store.id} variants={staggerItemVariants}>
                      <StyledButton
                        variant={
                          selectedStoreId === store.id ? "primary" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedStoreId(store.id)}
                        className="w-full justify-start"
                      >
                        {store.name}
                      </StyledButton>
                    </motion.div>
                  ))}
                </motion.div>
              </nav>

              <div className="mt-auto border-t border-stone-200 pt-4 text-sm text-stone-600 dark:border-neutral-700 dark:text-stone-400">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
                  Support
                </p>
                <p className="break-words">support@shophub.example.com</p>
              </div>
            </StyledCard>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Categories Section */}
            <motion.section
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="mb-12"
            >
              <motion.div variants={staggerItemVariants} className="mb-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
                      Browse
                    </p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      Shop by Category
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
                  className="rounded-lg bg-white dark:bg-gray-800 p-6 text-sm text-gray-500 shadow"
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
                  {categories.map((category, idx) => (
                    <motion.div
                      key={category.id}
                      variants={staggerItemVariants}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <CategoryTile
                        name={category.name}
                        image={isOnline ? category.image_url : null}
                        onClick={() => handleCategoryClick(category.slug)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.section>

            {/* Products Section */}
            <motion.section
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={staggerItemVariants} className="mb-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
                      Discover
                    </p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      Products
                    </h2>
                  </div>
                  {featuredProductsQuery.isFetching &&
                    featuredProducts.length > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Refreshing...
                      </span>
                    )}
                </div>

                {/* Search Input */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Search Products
                  </label>
                  <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-white/90 px-4 py-3 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)] transition-shadow focus-within:ring-2 focus-within:ring-amber-500 dark:border-neutral-700 dark:bg-neutral-800/90 dark:focus-within:ring-amber-400">
                    <Search
                      size={18}
                      className="text-gray-400 dark:text-gray-500"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search by product name, description, SKU, or slug"
                      className="w-full bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Products Grid */}
              {featuredProductsQuery.isLoading &&
              featuredProducts.length === 0 ? (
                <motion.div
                  variants={staggerItemVariants}
                  className="rounded-lg bg-white dark:bg-gray-800 p-6 text-sm text-gray-500 dark:text-gray-400 shadow"
                >
                  Loading products...
                </motion.div>
              ) : featuredProducts.length === 0 ? (
                <motion.div
                  variants={staggerItemVariants}
                  className="rounded-lg bg-white dark:bg-gray-800 p-6 text-sm text-gray-500 dark:text-gray-400 shadow"
                >
                  No products found for this filter.
                </motion.div>
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  variants={staggerItemVariants}
                  className="rounded-lg bg-white dark:bg-gray-800 p-6 text-sm text-gray-500 dark:text-gray-400 shadow"
                >
                  No products match "{searchTerm.trim()}".
                </motion.div>
              ) : (
                <motion.div
                  variants={staggerContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {filteredProducts.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      variants={staggerItemVariants}
                      transition={{ delay: idx * 0.02 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.section>
          </main>
        </div>
      </div>
    </div>
  );
}
