import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/useAuth";
import { CartItem, Product } from "../types";
import { Trash2, ChevronLeft, ShoppingCart } from "lucide-react";
import Button from "../components/ui/Button";
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

  const cartItems = cartQuery.data || [];

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-app py-8">
        <button
          onClick={() => onNavigate("home")}
          className="mb-8 flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ChevronLeft size={20} />
          Continue Shopping
        </button>

        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          {cartQuery.isFetching && cartItems.length > 0 && (
            <span className="text-sm text-gray-500">Refreshing...</span>
          )}
        </div>

        {cartQuery.error && cartItems.length === 0 ? (
          <div className="rounded-lg border border-red-200 bg-white p-8 text-center shadow dark:border-red-800 dark:bg-gray-800">
            <p className="mb-4 text-red-600 dark:text-red-300">
              {cartQuery.error}
            </p>
            <button
              type="button"
              onClick={() => void cartQuery.refetch()}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white"
            >
              Retry
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white py-16 text-center shadow dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
            <ShoppingCart
              className="mx-auto mb-4 text-gray-400 dark:text-gray-500"
              size={48}
            />
            <p className="mb-4 text-lg text-gray-600 dark:text-gray-400">
              Your cart is empty
            </p>
            <button
              onClick={() => onNavigate("home")}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              Start Shopping
            </button>
          </div>
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
                  <div
                    key={item.id}
                    className="flex gap-6 rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50"
                  >
                    {isOnline && item.product?.image_urls?.[0] ? (
                      <img
                        src={item.product.image_urls[0]}
                        alt={item.product.name}
                        className="h-24 w-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-lg border border-gray-200 bg-gradient-to-br from-gray-200 to-gray-300 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800" />
                    )}

                    <div className="flex-1">
                      <h3 className="mb-2 font-bold text-gray-900 dark:text-white">
                        {item.product?.name}
                      </h3>
                      <p className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                        RWF {(item.product?.price || 0).toLocaleString()}
                      </p>

                      <div className="flex w-fit items-center gap-3 rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                        <Button
                          onClick={() =>
                            void handleUpdateQuantity(
                              item.id,
                              item.quantity - 1,
                            )
                          }
                          className="px-3 py-1"
                          variant="ghost"
                        >
                          -
                        </Button>
                        <span className="px-3 font-bold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <Button
                          onClick={() =>
                            void handleUpdateQuantity(
                              item.id,
                              item.quantity + 1,
                            )
                          }
                          className="px-3 py-1"
                          variant="ghost"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="mb-4 text-gray-600 dark:text-gray-400">
                        RWF{" "}
                        {(
                          (item.product?.price || 0) * item.quantity
                        ).toLocaleString()}
                      </p>
                      <Button
                        onClick={() => void handleRemoveItem(item.id)}
                        className="flex items-center gap-2 font-medium text-red-600"
                        variant="ghost"
                      >
                        <Trash2 size={18} />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-fit rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
                <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                  Order Summary
                </h2>

                <div className="mb-6 space-y-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>RWF {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (18%)</span>
                    <span>RWF {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-bold text-gray-900 dark:border-gray-700 dark:text-white">
                    <span>Total</span>
                    <span>RWF {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate("checkout")}
                  className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
