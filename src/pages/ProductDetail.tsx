import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/useAuth";
import { Product } from "../types";
import { ShoppingCart } from "lucide-react";
import SafeImage from "../components/SafeImage";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProduct(data ?? null);
      } catch (err) {
        console.error("Failed to load product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!product) return <div>Product not found</div>;

  const addToCart = async () => {
    if (!session) return navigate("/login");

    await supabase.from("cart_items").upsert({
      user_id: session.user.id,
      product_id: product.id,
      quantity: 1,
    });

    navigate("/cart");
  };

  return (
    <div className="p-8">
      <button onClick={() => navigate(-1)}>← Back</button>

      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <SafeImage
          src={product.image_urls?.[0]}
          alt={product.name}
          className="rounded-lg"
        />

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-bold text-blue-600">
            RWF {product.price.toLocaleString()}
          </p>
          <p className="mt-4">{product.description}</p>

          <button
            onClick={addToCart}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded flex gap-2"
          >
            <ShoppingCart />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
