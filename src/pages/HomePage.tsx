import { supabase } from "../lib/supabase";
import { Category, Product } from "../types";
import { Search } from "lucide-react";
import ProductCard from "../components/ProductCard";
import CategoryTile from "../components/ui/CategoryTile";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { offlineMessage } from "../lib/errorHandling";

import { useShopFiltersStore } from "../stores/useShopFiltersStore";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-app py-12">
        {pageError && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <span>{pageError}</span>
            <button
              type="button"
              onClick={retryAll}
              className="rounded-lg border border-red-300 px-3 py-1 font-medium hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900/30"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex gap-6">
          <aside className="hidden w-64 md:block">
            <div className="card h-full p-4">
              <h3 className="mb-4 text-lg font-semibold">Partner Stores</h3>
              <nav className="flex-1 space-y-2">
                <button
                  onClick={() => setSelectedStoreId(null)}
                  className={`w-full rounded-md px-3 py-2 text-left transition ${!selectedStoreId ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  All Stores
                </button>

                {partnerStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => setSelectedStoreId(store.id)}
                    className={`w-full rounded-md px-3 py-2 text-left transition ${selectedStoreId === store.id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {store.name}
                  </button>
                ))}
              </nav>

              <div className="mt-auto text-sm text-slate-500">
                <p className="text-xs">Contact</p>
                <p className="mt-1">support@shophub.example.com</p>
              </div>
            </div>
          </aside>

          <main className="flex-1 md:pl-6">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Shop by Category
              </h2>
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
              <div className="mb-8 grid gap-6 md:grid-cols-2">
                {categories.map((category) => (
                  <CategoryTile
                    key={category.id}
                    name={category.name}
                    image={isOnline ? category.image_url : null}
                    onClick={() => handleCategoryClick(category.slug)}
                  />
                ))}
              </div>
            )}

            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Products
              </h2>
              {featuredProductsQuery.isFetching &&
                featuredProducts.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Refreshing...
                  </span>
                )}
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Search Products
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <Search
                  size={18}
                  className="text-gray-400 dark:text-gray-500"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by product name, description, SKU, or slug"
                  className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            {featuredProductsQuery.isLoading &&
            featuredProducts.length === 0 ? (
              <div className="card p-6 text-sm text-slate-500">
                Loading products...
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="card p-6 text-sm text-slate-500">
                No products found for this filter.
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="card p-6 text-sm text-slate-500">
                No products match "{searchTerm.trim()}".
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
