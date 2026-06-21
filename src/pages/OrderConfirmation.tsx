import { CheckCircle, ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabase";
import { Order, OrderItem } from "../types";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import OrderProgress from "../components/OrderProgress";
import USSDPayment from "../components/USSDPayment";
import { useState } from "react";

export default function OrderConfirmation() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const orderQuery = usePersistentQuery<Order | null>({
    queryKey: `order-confirmation:${session?.user.id || "guest"}:${id}`,
    enabled: Boolean(session?.user.id && id),
    staleTimeMs: 30 * 1000,
    fallbackError: "Unable to load this order.",
    initialData: null,
    fetcher: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", session!.user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ?? null;
    },
  });

  const order = orderQuery.data;
  const [showUSSD, setShowUSSD] = useState(false);

  const itemsQuery = usePersistentQuery<OrderItem[]>({
    queryKey: `order-confirmation-items:${session?.user.id || "guest"}:${id}`,
    enabled: Boolean(session?.user.id && id),
    staleTimeMs: 30 * 1000,
    fallbackError: "Unable to load order items.",
    initialData: [],
    fetcher: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
  });

  const items = itemsQuery.data || [];

  if (orderQuery.isLoading && !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
        <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
          Loading order confirmation...
        </div>
      </div>
    );
  }

  if (orderQuery.error && !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <p className="mb-4 text-sm text-red-600">{orderQuery.error}</p>
          <button
            type="button"
            onClick={() => void orderQuery.refetch()}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
        <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
          Order not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-app py-12">
        <div className="w-full max-w-lg mx-auto card text-center p-8">
          <CheckCircle
            className="mx-auto mb-6 text-green-600 dark:text-green-400"
            size={64}
          />

          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Order Confirmed!
          </h1>

          <p className="mb-2 text-gray-600 dark:text-gray-400">
            Your order has been placed successfully.
          </p>

          <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Order ID:{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {order.order_number}
            </span>
          </p>

          <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
            Total paid:{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              RWF {order.total_amount.toLocaleString()}
            </span>
          </p>

          <div className="space-y-4 text-left">
            {order && <OrderProgress order={order} />}

            {items.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Items in this order
                </h3>
                <div className="space-y-2">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span>
                        {it.product_name} x{it.quantity}
                      </span>
                      <span>RWF {it.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => navigate("/cart")}
                    className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    View Cart
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate(`/orders/${order.id}`)}
                className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Track Order
              </button>

              {order.payment_status !== "completed" && (
                <button
                  onClick={() => setShowUSSD(true)}
                  className="w-full rounded-lg bg-green-600 py-3 font-medium text-white transition hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                >
                  Complete Payment (USSD)
                </button>
              )}
            </div>

            <button
              onClick={() => navigate("/")}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={18} />
              Continue Shopping
            </button>
          </div>

          {showUSSD && (
            <USSDPayment
              amount={order.total_amount}
              orderId={order.id}
              onClose={() => setShowUSSD(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
