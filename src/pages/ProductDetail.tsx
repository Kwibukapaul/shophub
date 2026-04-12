import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/useAuth";
import { Product } from "../types";
import { ShoppingCart } from "lucide-react";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isOnline = useOnlineStatus();
  const productQuery = usePersistentQuery<Product | null>({
    queryKey: `product:${id}`,
    enabled: Boolean(id),
    staleTimeMs: 60 * 1000,
    fallbackError: "Unable to load this product.",
    initialData: null,
    fetcher: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },
  });

  const product = productQuery.data;

  if (productQuery.isLoading && !product) {
    return <div className="p-8">Loading product...</div>;
  }

  if (productQuery.error && !product) {
    return (
      <div className="p-8">
        <p className="mb-4 text-red-600">{productQuery.error}</p>
        <button
          type="button"
          onClick={() => void productQuery.refetch()}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!product) {
    return <div className="p-8">Product not found.</div>;
  }

  const addToCart = async () => {
    try {
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", session.user.id)
        .eq("product_id", product.id)
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
          product_id: product.id,
          quantity: 1,
        });

        if (error) {
          throw error;
        }
      }

      navigate("/cart");
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  return (
    <div className="p-8">
      <button onClick={() => navigate(-1)}>Back</button>

      {productQuery.error && product && (
        <div className="mb-6 mt-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <span>{productQuery.error}</span>
          <button
            type="button"
            onClick={() => void productQuery.refetch()}
            className="rounded border border-amber-300 px-3 py-1 font-medium hover:bg-amber-100"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        {isOnline && product.image_urls?.[0] ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="rounded-lg"
          />
        ) : (
          <div className="min-h-80 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300" />
        )}

        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {productQuery.isFetching && (
              <span className="text-sm text-gray-500">Refreshing...</span>
            )}
          </div>
          <p className="text-2xl font-bold text-blue-600">
            RWF {product.price.toLocaleString()}
          </p>
          <p className="mt-4">{product.description}</p>

          <button
            onClick={addToCart}
            className="mt-6 flex gap-2 rounded bg-blue-600 px-6 py-3 text-white"
          >
            <ShoppingCart />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
