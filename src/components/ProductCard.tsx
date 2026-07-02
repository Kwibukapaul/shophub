import { addToCart } from "../lib/cart";
import { useAuth } from "../context/useAuth";
import { useState, useEffect } from "react";
import { Star, ShoppingBag } from "lucide-react";
import StyledButton from "./ui/StyledButton";
import Badge from "./ui/Badge";
import StyledCard from "./ui/StyledCard";
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
    <StyledCard variant="hover" className="group h-full overflow-hidden p-0">
      <div className="relative overflow-hidden rounded-t-[24px]">
        <img
          src={product.image_urls?.[0] || "/"}
          alt={product.name}
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.is_featured && (
          <div className="absolute left-3 top-3">
            <Badge color="amber">Featured</Badge>
          </div>
        )}
      </div>

      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-white">
              {product.name}
            </h3>
            <p className="mt-1 text-sm leading-6 text-stone-500 line-clamp-2 dark:text-stone-400">
              {product.description}
            </p>
          </div>
          <div className="text-base font-bold text-stone-900 dark:text-white">
            RWF {product.price.toLocaleString()}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleRate(s)}
                  className={`transition-transform hover:scale-110 ${(avg ?? 0) >= s ? "text-amber-400" : "text-stone-200"}`}
                  aria-label={`Rate ${s} stars`}
                >
                  <Star size={14} />
                </button>
              ))}
            </div>
            <span className="text-sm text-stone-500 dark:text-stone-400">
              {avg ? `${avg}/5` : "No rating"}
            </span>
          </div>
        </div>

        <StyledButton
          onClick={handleAdd}
          variant="primary"
          size="sm"
          className="mt-4 w-full"
          leftIcon={<ShoppingBag size={16} />}
        >
          Add to Cart
        </StyledButton>
      </div>
    </StyledCard>
  );
}
