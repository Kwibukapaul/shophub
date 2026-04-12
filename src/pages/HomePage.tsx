import { supabase } from "../lib/supabase";
import { Category, Product } from "../types";
import { Search, ShoppingCart } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { offlineMessage } from "../lib/errorHandling";
import { useCartStore } from "../stores/useCartStore";
import { useShopFiltersStore } from "../stores/useShopFiltersStore";

interface HomePageProps {
  onNavigate: (page: string) => void;
  setCategorySlug: (slug: string) => void;
  setProductId?: (id: string) => void;
}

export default function HomePage({
  onNavigate,
  setCategorySlug,
  setProductId,
}: HomePageProps) {
  const { session } = useAuth();
  const isOnline = useOnlineStatus();
  const adjustItemCount = useCartStore((state) => state.adjustItemCount);
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

  const handleViewProduct = (id: string) => {
    if (!session) {
      onNavigate("login");
      return;
    }

    if (setProductId) {
      setProductId(id);
    } else {
      onNavigate(`product/${id}`);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      if (!session) {
        onNavigate("login");
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", session.user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("cart_items").insert({
          user_id: session.user.id,
          product_id: productId,
          quantity: 1,
        });

        if (error) {
          throw error;
        }
      }

      adjustItemCount(1);
      onNavigate("cart");
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

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
      <div className="mx-auto max-w-7xl px-6 py-12">
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
            <div className="flex h-full flex-col bg-gradient-to-b from-gray-900 to-gray-800 p-4 text-white shadow-xl">
              <h3 className="mb-4 text-xl font-bold">Partner Stores</h3>
              <nav className="flex-1 space-y-2">
                <button
                  onClick={() => setSelectedStoreId(null)}
                  className={`w-full rounded-lg px-4 py-3 text-left transition ${
                    !selectedStoreId
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  All Stores
                </button>

                {partnerStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => setSelectedStoreId(store.id)}
                    className={`w-full rounded-lg px-4 py-3 text-left transition ${
                      selectedStoreId === store.id
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    {store.name}
                  </button>
                ))}
              </nav>

              <div className="mt-auto text-sm text-gray-300">
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
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.slug)}
                    className="relative h-40 overflow-hidden rounded-lg shadow"
                  >
                    {isOnline && category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-700 dark:to-gray-800" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <h3 className="text-2xl font-bold text-white">
                        {category.name}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Products
              </h2>
              {featuredProductsQuery.isFetching && featuredProducts.length > 0 && (
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
                <Search size={18} className="text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by product name, description, SKU, or slug"
                  className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                />
              </div>
            </div>

            {featuredProductsQuery.isLoading && featuredProducts.length === 0 ? (
              <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
                Loading products...
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
                No products found for this filter.
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
                No products match "{searchTerm.trim()}".
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-lg bg-white p-4 shadow dark:bg-gray-800"
                  >
                    {isOnline && product.image_urls?.[0] ? (
                      <img
                        src={product.image_urls[0]}
                        alt={product.name}
                        className="h-40 w-full rounded object-cover"
                      />
                    ) : (
                      <div className="h-40 w-full rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
                    )}

                    <h3 className="mt-3 font-bold text-gray-900 dark:text-white">
                      {product.name}
                    </h3>

                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      RWF {product.price.toLocaleString()}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProduct(product.id)}
                        className="flex-1 rounded border py-2 text-sm dark:border-gray-600 dark:text-gray-200"
                      >
                        View
                      </button>

                      <button
                        onClick={() => void handleAddToCart(product.id)}
                        className="flex-1 rounded bg-blue-600 py-2 text-sm text-white dark:bg-blue-700"
                        disabled={product.stock_quantity === 0}
                      >
                        <ShoppingCart size={16} className="mr-1 inline" /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
