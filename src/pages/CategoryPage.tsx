import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Product } from "../types";
import { Star } from "lucide-react";
import SafeImage from "../components/SafeImage";

export default function CategoryPage() {
  const { slug = "electronics" } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const { data: category } = await supabase
        .from("categories")
        .select("id, name")
        .eq("slug", slug)
        .single();

      if (!category) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setCategoryName(category.name);

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", category.id)
        .eq("is_active", true);

      setProducts(data || []);
      setLoading(false);
    };

    fetchProducts();
  }, [slug]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{categoryName}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => navigate(`/product/${p.id}`)}
            className="bg-white p-4 rounded shadow cursor-pointer"
          >
            <SafeImage
              src={p.image_urls?.[0]}
              alt={p.name}
              className="h-40 w-full object-cover"
            />
            <h3 className="font-bold mt-2">{p.name}</h3>
            <p className="text-blue-600 font-bold">
              RWF {p.price.toLocaleString()}
            </p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.floor(p.rating || 0)
                      ? "text-yellow-400 fill-yellow-400"
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
