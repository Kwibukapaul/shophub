import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/useAuth";
import { CartItem, Product } from "../types";
import { Trash2, ChevronLeft, ShoppingCart } from "lucide-react";
import SafeImage from "../components/SafeImage";

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { session } = useAuth();
  const [cartItems, setCartItems] = useState<
    (CartItem & { product: Product })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      onNavigate("login");
      return;
    }

    const fetchCart = async () => {
      try {
        const { data, error } = await supabase
          .from("cart_items")
          .select("*, product:products(*)")
          .eq("user_id", session.user.id);

        if (error) throw error;
        setCartItems(data || []);
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [session, onNavigate]);

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;
      setCartItems(cartItems.filter((item) => item.id !== cartItemId));
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const handleUpdateQuantity = async (
    cartItemId: string,
    newQuantity: number
  ) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", cartItemId);

      if (error) throw error;
      setCartItems(
        cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 font-medium"
        >
          <ChevronLeft size={20} />
          Continue Shopping
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
            <ShoppingCart
              className="mx-auto text-gray-400 dark:text-gray-500 mb-4"
              size={48}
            />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              Your cart is empty
            </p>
            <button
              onClick={() => onNavigate("home")}
              className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 flex gap-6 border border-gray-200 dark:border-gray-700"
                >
                  {item.product?.image_urls && item.product.image_urls[0] && (
                    <SafeImage
                      src={item.product.image_urls[0]}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  )}

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      {item.product?.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      RWF {(item.product?.price || 0).toLocaleString()}
                    </p>

                    <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg w-fit bg-white dark:bg-gray-700">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        −
                      </button>
                      <span className="px-3 font-bold text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      RWF{" "}
                      {(
                        (item.product?.price || 0) * item.quantity
                      ).toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 h-fit border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
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
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>RWF {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate("checkout")}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-bold"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
