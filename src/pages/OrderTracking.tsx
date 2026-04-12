import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabase";
import { Order, OrderItem } from "../types";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import OrderProgress from "../components/OrderProgress";
import { useState } from "react";
import { useToastStore } from "../stores/useToastStore";

interface OrderTrackingData {
  order: Order | null;
  items: OrderItem[];
  history: Array<{
    status: string;
    note: string | null;
    created_at: string;
  }>;
}

const statusOrder = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const buildFallbackHistory = (order: Order) => {
  const currentIndex = statusOrder.indexOf(order.status);

  return statusOrder.map((status, index) => ({
    status,
    note:
      index <= currentIndex ? "Status recorded from order details" : "Pending",
    created_at:
      index <= currentIndex
        ? index === 0
          ? order.created_at
          : order.updated_at
        : "",
  }));
};

export default function OrderTracking() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const trackingQuery = usePersistentQuery<OrderTrackingData>({
    queryKey: `order-tracking:${session?.user.id || "guest"}:${id}`,
    enabled: Boolean(session?.user.id && id),
    staleTimeMs: 30 * 1000,
    fallbackError: "Unable to load this order.",
    initialData: { order: null, items: [], history: [] },
    fetcher: async () => {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", session!.user.id)
        .maybeSingle();

      if (orderError) {
        throw orderError;
      }

      if (!order) {
        return { order: null, items: [], history: [] };
      }

      const [
        { data: items, error: itemsError },
        { data: history, error: historyError },
      ] = await Promise.all([
        supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("order_status_history")
          .select("status, note, created_at")
          .eq("order_id", order.id)
          .order("created_at", { ascending: true }),
      ]);

      if (itemsError) {
        throw itemsError;
      }

      if (historyError) {
        throw historyError;
      }

      return {
        order,
        items: items || [],
        history:
          history && history.length > 0 ? history : buildFallbackHistory(order),
      };
    },
  });

  const data = trackingQuery.data || { order: null, items: [], history: [] };

  if (trackingQuery.isLoading && !data.order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
            Loading order tracking...
          </div>
        </div>
      </div>
    );
  }

  if (trackingQuery.error && !data.order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <p className="mb-4">{trackingQuery.error}</p>
            <button
              type="button"
              onClick={() => void trackingQuery.refetch()}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data.order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
            Order not found.
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(data.order.status);
  const [cancelling, setCancelling] = useState(false);
  const pushToast = useToastStore((s) => s.push);

  const handleCancelOrder = async () => {
    if (!data.order) return;

    const ok = window.confirm(
      "Are you sure you want to cancel this order? This will remove the order and its items permanently.",
    );
    if (!ok) return;

    setCancelling(true);
    try {
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", data.order.id);

      if (itemsError) throw itemsError;

      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", data.order.id);

      if (orderError) throw orderError;

      pushToast({
        id: `order-cancelled-${data.order.id}`,
        message: "Order cancelled and removed.",
        duration: 4000,
      });
      void trackingQuery.refetch();
      // navigate back to orders list
      navigate("/orders");
    } catch (err) {
      console.error("Failed to cancel order:", err);
      pushToast({
        id: `order-cancel-fail-${data.order.id}`,
        message: "Failed to cancel order.",
        duration: 5000,
      });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/orders")}
          className="mb-8 flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ChevronLeft size={20} />
          Back to Orders
        </button>

        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Order Tracking
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {data.order.order_number} �{" "}
                {new Date(data.order.created_at).toLocaleString()}
              </p>
            </div>
            {trackingQuery.isFetching && (
              <span className="text-sm text-gray-500">Refreshing...</span>
            )}
          </div>

          <div className="mb-6 flex gap-3">
            {data.order &&
              !["shipped", "delivered", "cancelled"].includes(
                data.order.status,
              ) && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
          </div>

          {data.order && (
            <div id="progress">
              <OrderProgress order={data.order} />
            </div>
          )}

          <div className="space-y-8">
            {statusOrder.map((status, index) => {
              const isComplete = index <= currentIndex;
              const historyEntry = data.history.find(
                (entry) => entry.status === status,
              );

              return (
                <div key={status} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full font-bold ${
                        isComplete
                          ? "bg-blue-600 text-white dark:bg-blue-700"
                          : "border-2 border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500"
                      }`}
                    >
                      {isComplete ? "OK" : index + 1}
                    </div>
                    {index < statusOrder.length - 1 && (
                      <div
                        className={`w-1 ${
                          isComplete
                            ? "bg-blue-600 dark:bg-blue-700"
                            : "bg-gray-300 dark:bg-gray-600"
                        } h-16`}
                      ></div>
                    )}
                  </div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {historyEntry?.created_at
                        ? new Date(historyEntry.created_at).toLocaleString()
                        : "Waiting for update"}
                    </p>
                    {historyEntry?.note && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {historyEntry.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-700">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Items in this order
            </h2>
            <div className="space-y-3">
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900/30"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {item.product_name} x{item.quantity}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    RWF {item.subtotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
