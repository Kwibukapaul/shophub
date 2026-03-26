import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Category, Product } from "../types";
import { ShoppingBag, Star, ShoppingCart } from "lucide-react";
import { useAuth } from "../context/useAuth";
import SafeImage from "../components/SafeImage";

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

  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [partnerStores, setPartnerStores] = useState<any[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .order("display_order");

        setCategories(data || []);
      } catch (err) {
        console.error("fetchCategories failed:", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchFeaturedProducts = async () => {
      try {
        let query = supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        // apply partner store filter if selected
        if (selectedStoreId) {
          query = (query as any).eq("partner_store_id", selectedStoreId);
        }

        // apply category filter if selected
        if (selectedCategorySlug) {
          // look up category id
          const { data: cats } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", selectedCategorySlug)
            .limit(1)
            .single();
          if (cats && cats.id) {
            query = (query as any).eq("category_id", cats.id);
          }
        }

        const { data } = await query;

        setFeaturedProducts(data || []);
      } catch (err) {
        console.error("fetchFeaturedProducts failed:", err);
        setFeaturedProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    const fetchPartnerStores = async () => {
      try {
        const { data } = await supabase
          .from("partner_stores")
          .select("*")
          .eq("is_active", true)
          .order("name");
        setPartnerStores(data || []);
      } catch (err) {
        console.error("fetchPartnerStores failed:", err);
        setPartnerStores([]);
      }
    };

    fetchCategories();
    fetchPartnerStores();
    fetchFeaturedProducts();
  }, []);

  // refetch products when filters change
  useEffect(() => {
    const load = async () => {
      setProductsLoading(true);
      try {
        let query = supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (selectedStoreId)
          (query as any).eq("partner_store_id", selectedStoreId);

        if (selectedCategorySlug) {
          const { data: cats } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", selectedCategorySlug)
            .limit(1)
            .single();
          if (cats && cats.id) (query as any).eq("category_id", cats.id);
        }

        const { data } = await query;
        setFeaturedProducts(data || []);
      } catch (err) {
        console.error(err);
        setFeaturedProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    load();
  }, [selectedStoreId, selectedCategorySlug]);

  const handleCategoryClick = (slug: string) => {
    setSelectedCategorySlug(slug);
    setCategorySlug(slug);
    onNavigate(session ? `category/${slug}` : "login");
  };

  const handleViewProduct = (id: string) => {
    if (setProductId) setProductId(id);
    onNavigate(session ? "product" : "login");
  };

  const handleAddToCart = async (productId: string) => {
    if (!session) {
      onNavigate("login");
      return;
    }

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", session.user.id)
      .eq("product_id", productId)
      .single();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: session.user.id,
        product_id: productId,
        quantity: 1,
      });
    }

    onNavigate("cart");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex">
          {/* Sidebar (admin-like) */}
          <aside className="w-64 hidden md:block">
            <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4 flex flex-col">
              <h3 className="text-xl font-bold mb-4">Partner Stores</h3>
              <nav className="flex-1 space-y-2">
                <button
                  onClick={() => setSelectedStoreId(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${!selectedStoreId ? "bg-blue-600 text-white shadow-lg" : "text-gray-300 hover:bg-gray-800"}`}
                >
                  All Stores
                </button>

                {partnerStores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStoreId(s.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${selectedStoreId === s.id ? "bg-blue-600 text-white shadow-lg" : "text-gray-300 hover:bg-gray-800"}`}
                  >
                    {s.name}
                  </button>
                ))}
              </nav>

              <div className="mt-auto">
                <p className="text-xs text-gray-300">Contact</p>
                <p className="text-sm text-gray-200 mt-1">
                  support@shophub.example.com
                </p>
              </div>
            </div>
          </aside>

          <main className="flex-1 md:pl-6">
            {/* Categories */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Shop by Category
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {!loading &&
                categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className="relative h-40 rounded-lg overflow-hidden shadow"
                  >
                    <SafeImage
                      src={cat.image_url ?? undefined}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <h3 className="text-white text-2xl font-bold">
                        {cat.name}
                      </h3>
                    </div>
                  </button>
                ))}
            </div>

            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Products
            </h2>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {!productsLoading &&
                featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
                  >
                    <SafeImage
                      src={product.image_urls?.[0] ?? undefined}
                      alt={product.name}
                      className="h-40 w-full object-cover rounded"
                    />

                    <h3 className="font-bold mt-3 text-gray-900 dark:text-white">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-500 mb-2">
                      RWF {product.price.toLocaleString()}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewProduct(product.id)}
                        className="flex-1 border rounded py-2 text-sm"
                      >
                        View
                      </button>

                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="flex-1 bg-blue-600 text-white rounded py-2 text-sm"
                        disabled={product.stock_quantity === 0}
                      >
                        <ShoppingCart size={16} className="inline mr-1" /> Add
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
