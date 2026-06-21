import { addToCart } from "../lib/cart";
import { useAuth } from "../context/useAuth";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { useToastStore } from "../stores/useToastStore";

export default function ProductCard({ product }: any) {
  const { session } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const pushToast = useToastStore((s) => s.push);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`rating:${product.id}`);
      if (raw) setRating(Number(raw));
    } catch (e) {
      // ignore
    }
  }, [product.id]);

  const handleAdd = async () => {
    if (!session?.user) {
      pushToast({
        id: `login-needed-${product.id}`,
        message: "Please login to add items to cart",
        type: "info",
      });
      return;
    }

    await addToCart(session.user.id, product.id);
    pushToast({
      id: `added-${product.id}`,
      message: "Added to cart",
      type: "success",
    });
  };

  const handleRate = (value: number) => {
    setRating(value);
    try {
      localStorage.setItem(`rating:${product.id}`, String(value));
    } catch (e) {
      // ignore
    }
  };

  const avg = product.avg_rating ?? rating;

  return (
    <article className="card transform transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative overflow-hidden rounded-md">
        <img
          src={product.image_urls?.[0] || "/"}
          alt={product.name}
          className="h-48 w-full object-cover"
        />
        {product.is_featured && (
          <div className="absolute left-3 top-3">
            <Badge>Featured</Badge>
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-md font-semibold text-slate-900">{product.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mt-1">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-yellow-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleRate(s)}
                  className={`transition-transform hover:scale-110 ${
                    (avg ?? 0) >= s ? "text-yellow-400" : "text-gray-200"
                  }`}
                  aria-label={`Rate ${s} stars`}
                >
                  <Star size={14} />
                </button>
              ))}
            </div>
            <span className="text-sm text-slate-500">
              {avg ? `${avg}/5` : "No rating"}
            </span>
          </div>

          <div className="text-lg font-bold text-slate-900">
            RWF {product.price.toLocaleString()}
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={handleAdd} className="w-full" variant="primary">
            Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
}
