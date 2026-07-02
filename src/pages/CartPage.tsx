import { useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/useAuth";
import { CartItem, Product } from "../types";
import { Trash2, ChevronLeft, ShoppingCart, ArrowRight } from "lucide-react";
import StyledButton from "../components/ui/StyledButton";
import StyledCard from "../components/ui/StyledCard";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useCartStore } from "../stores/useCartStore";

interface CartPageProps {
  onNavigate: (page: string) => void;
}

type CartRow = CartItem & { product: Product | null };

export default function CartPage({ onNavigate }: CartPageProps) {
  const { session } = useAuth();
  const isOnline = useOnlineStatus();
  const setItemCount = useCartStore((state) => state.setItemCount);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartQuery = usePersistentQuery<CartRow[]>({
    queryKey: `cart:${session?.user.id || "guest"}`,
    enabled: Boolean(session?.user.id),
    staleTimeMs: 15 * 1000,
    fallbackError: "Unable to load your cart.",
    initialData: [],
    fetcher: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", session!.user.id);

      if (error) {
        throw error;
      }

      return (data || []) as CartRow[];
    },
  });

  useEffect(() => {
    if (!session) {
      onNavigate("login");
    }
  }, [onNavigate, session]);

  const cartItems = useMemo(() => cartQuery.data || [], [cartQuery.data]);

  useEffect(() => {
    if (!session?.user.id) {
      clearCart();
      return;
    }

    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    setItemCount(totalQuantity);
  }, [cartItems, clearCart, session?.user.id, setItemCount]);

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      cartQuery.setData((items) =>
        (items || []).filter((item) => item.id !== cartItemId),
      );

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error removing item:", error);
      cartQuery.setData(cartItems);
    }
  };

  const handleUpdateQuantity = async (
    cartItemId: string,
    newQuantity: number,
  ) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(cartItemId);
      return;
    }

    try {
      cartQuery.setData((items) =>
        (items || []).map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item,
        ),
      );

      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", cartItemId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      cartQuery.setData(cartItems);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  if (cartQuery.isLoading && cartItems.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_45%),linear-gradient(180deg,_#faf7f2_0%,_#f5efe7_100%)] dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-600 dark:border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_45%),linear-gradient(180deg,_#faf7f2_0%,_#f5efe7_100%)] dark:bg-gray-900">
      <div className="container-app py-8">
        <button
          onClick={() => onNavigate("home")}
          className="mb-8 inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium text-stone-700 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <ChevronLeft size={20} />
          Continue Shopping
        </button>

        <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] md:flex-row md:items-end md:justify-between dark:border-neutral-700 dark:bg-neutral-800/80">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
              Bag
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-white">
              Shopping Cart
            </h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Review your selected items and continue to checkout with
              confidence.
            </p>
          </div>
          {cartQuery.isFetching && cartItems.length > 0 && (
            <span className="text-sm text-stone-500">Refreshing...</span>
          )}
        </div>

        {cartQuery.error && cartItems.length === 0 ? (
          <div className="rounded-[24px] border border-red-200 bg-white p-8 text-center shadow dark:border-red-800 dark:bg-neutral-800">
            <p className="mb-4 text-red-600 dark:text-red-300">
              {cartQuery.error}
            </p>
            <button
              type="button"
              onClick={() => void cartQuery.refetch()}
              className="rounded-full bg-amber-600 px-4 py-2 font-medium text-white"
            >
              Retry
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <StyledCard className="py-16 text-center">
            <ShoppingCart
              className="mx-auto mb-4 text-stone-400 dark:text-stone-500"
              size={48}
            />
            <p className="mb-4 text-lg text-stone-600 dark:text-stone-400">
              Your cart is empty
            </p>
            <StyledButton
              onClick={() => onNavigate("home")}
              variant="primary"
              className="mt-2"
            >
              Start Shopping
            </StyledButton>
          </StyledCard>
        ) : (
          <>
            {cartQuery.error && (
              <div className="mb-6 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                <span>{cartQuery.error}</span>
                <button
                  type="button"
                  onClick={() => void cartQuery.refetch()}
                  className="rounded border border-amber-300 px-3 py-1 font-medium hover:bg-amber-100"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {cartItems.map((item) => (
                  <StyledCard
                    key={item.id}
                    className="flex flex-col gap-5 p-6 md:flex-row md:items-center"
                  >
                    {isOnline && item.product?.image_urls?.[0] ? (
                      <img
                        src={item.product.image_urls[0]}
                        alt={item.product.name}
                        className="h-24 w-24 rounded-2xl border border-stone-200 object-cover dark:border-neutral-700"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-200 to-stone-400 dark:border-neutral-700 dark:from-neutral-700 dark:to-neutral-800" />
                    )}

                    <div className="flex-1">
                      <h3 className="mb-2 font-semibold text-stone-900 dark:text-white">
                        {item.product?.name}
                      </h3>
                      <p className="mb-4 text-lg font-semibold text-stone-900 dark:text-white">
                        RWF {(item.product?.price || 0).toLocaleString()}
                      </p>

                      <div className="flex w-fit items-center gap-3 rounded-full border border-stone-200 bg-stone-50 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-700/60">
                        <StyledButton
                          onClick={() =>
                            void handleUpdateQuantity(
                              item.id,
                              item.quantity - 1,
                            )
                          }
                          className="px-3 py-1"
                          variant="ghost"
                          size="sm"
                        >
                          -
                        </StyledButton>
                        <span className="px-3 font-semibold text-stone-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <StyledButton
                          onClick={() =>
                            void handleUpdateQuantity(
                              item.id,
                              item.quantity + 1,
                            )
                          }
                          className="px-3 py-1"
                          variant="ghost"
                          size="sm"
                        >
                          +
                        </StyledButton>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="mb-4 text-stone-600 dark:text-stone-400">
                        RWF{" "}
                        {(
                          (item.product?.price || 0) * item.quantity
                        ).toLocaleString()}
                      </p>
                      <StyledButton
                        onClick={() => void handleRemoveItem(item.id)}
                        className="flex items-center gap-2 font-medium text-red-600"
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 size={18} />
                        Remove
                      </StyledButton>
                    </div>
                  </StyledCard>
                ))}
              </div>

              <StyledCard className="h-fit p-6">
                <h2 className="mb-6 text-xl font-semibold text-stone-900 dark:text-white">
                  Order Summary
                </h2>

                <div className="mb-6 space-y-4 text-sm text-stone-600 dark:text-stone-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>RWF {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18%)</span>
                    <span>RWF {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-4 text-lg font-semibold text-stone-900 dark:border-neutral-700 dark:text-white">
                    <span>Total</span>
                    <span>RWF {total.toLocaleString()}</span>
                  </div>
                </div>

                <StyledButton
                  onClick={() => onNavigate("checkout")}
                  variant="primary"
                  size="md"
                  className="w-full"
                  rightIcon={<ArrowRight size={16} />}
                >
                  Proceed to Checkout
                </StyledButton>
              </StyledCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
