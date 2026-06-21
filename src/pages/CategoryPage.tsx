import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Product } from "../types";
import { Star } from "lucide-react";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

interface CategoryData {
  categoryName: string;
  products: Product[];
}

export default function CategoryPage() {
  const { slug = "electronics" } = useParams();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const categoryQuery = usePersistentQuery<CategoryData>({
    queryKey: `category-page:${slug}`,
    staleTimeMs: 60 * 1000,
    fallbackError: "Unable to load this category.",
    initialData: { categoryName: "", products: [] },
    fetcher: async () => {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id, name")
        .eq("slug", slug)
        .maybeSingle();

      if (categoryError) {
        throw categoryError;
      }

      if (!category) {
        return {
          categoryName: "",
          products: [],
        };
      }

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", category.id)
        .eq("is_active", true);

      if (productsError) {
        throw productsError;
      }

      return {
        categoryName: category.name,
        products: products || [],
      };
    },
  });

  const categoryData = categoryQuery.data || { categoryName: "", products: [] };

  if (categoryQuery.isLoading && categoryData.products.length === 0) {
    return <div className="p-8">Loading category...</div>;
  }

  if (categoryQuery.error && categoryData.products.length === 0) {
    return (
      <div className="p-8">
        <p className="mb-4 text-red-600">{categoryQuery.error}</p>
        <button
          type="button"
          onClick={() => void categoryQuery.refetch()}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!categoryData.categoryName) {
    return <div className="p-8">Category not found.</div>;
  }

  return (
    <div className="container-app py-8">
      {categoryQuery.error && categoryData.products.length > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <span>{categoryQuery.error}</span>
          <button
            type="button"
            onClick={() => void categoryQuery.refetch()}
            className="rounded border border-amber-300 px-3 py-1 font-medium hover:bg-amber-100"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">
          {categoryData.categoryName}
        </h1>
        {categoryQuery.isFetching && (
          <span className="text-sm text-slate-500">Refreshing...</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categoryData.products.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className="cursor-pointer card p-4"
          >
            {isOnline && product.image_urls?.[0] ? (
              <img
                src={product.image_urls[0]}
                alt={product.name}
                className="h-44 w-full object-cover rounded-md"
              />
            ) : (
              <div className="h-44 w-full rounded-md bg-gradient-to-br from-gray-200 to-gray-300" />
            )}

            <h3 className="mt-3 font-semibold text-slate-900">
              {product.name}
            </h3>
            <p className="font-bold text-slate-900">
              RWF {product.price.toLocaleString()}
            </p>
            <div className="flex mt-2">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  className={
                    index < Math.floor(product.rating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
