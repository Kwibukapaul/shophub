import { ChevronLeft, Eye, ShoppingBag, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabase";
import { Order, OrderItem } from "../types";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import {
  getOrderProgressPercent,
  getOrderStatusClasses,
  getOrderStatusDescription,
} from "../lib/orderProgress";

interface OrderWithItems extends Order {
  items: OrderItem[];
}

export default function OrderHistory() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const ordersQuery = usePersistentQuery<OrderWithItems[]>({
    queryKey: `orders:${session?.user.id || "guest"}`,
    enabled: Boolean(session?.user.id),
    staleTimeMs: 30 * 1000,
    fallbackError: "Unable to load your orders.",
    initialData: [],
    fetcher: async () => {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      if (!orders || orders.length === 0) {
        return [];
      }

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .in(
          "order_id",
          orders.map((order) => order.id),
        )
        .order("created_at", { ascending: true });

      if (itemsError) {
        throw itemsError;
      }

      const itemsByOrderId = new Map<string, OrderItem[]>();

      (items || []).forEach((item) => {
        const currentItems = itemsByOrderId.get(item.order_id) || [];
        currentItems.push(item);
        itemsByOrderId.set(item.order_id, currentItems);
      });

      return orders.map((order) => ({
        ...order,
        items: itemsByOrderId.get(order.id) || [],
      }));
    },
  });

  const orders = ordersQuery.data || [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_45%),linear-gradient(180deg,_#faf7f2_0%,_#f5efe7_100%)] dark:bg-gray-900">
      <div className="container-app py-8">
        <button
          onClick={() => navigate("/")}
          className="mb-8 inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium text-stone-700 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] md:flex-row md:items-end md:justify-between dark:border-neutral-700 dark:bg-neutral-800/80">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
              Orders
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-white">
              Order History
            </h1>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Track active orders, review ordered items, and keep shopping while
              your deliveries move forward.
            </p>
          </div>
          {ordersQuery.isFetching && orders.length > 0 && (
            <span className="text-sm text-stone-500">Refreshing...</span>
          )}
        </div>

        {ordersQuery.error && orders.length === 0 && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <span>{ordersQuery.error}</span>
            <button
              type="button"
              onClick={() => void ordersQuery.refetch()}
              className="rounded-lg border border-red-300 px-3 py-1 font-medium hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900/30"
            >
              Retry
            </button>
          </div>
        )}

        {ordersQuery.isLoading && orders.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-gray-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
              <Package size={20} />
            </div>
            <p>You have not placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const totalItems = (order.items || []).reduce(
                (sum, item) => sum + (item?.quantity || 0),
                0,
              );

              return (
                <div
                  key={order.id}
                  className="rounded-[24px] border border-stone-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_24px_80px_-30px_rgba(15,23,42,0.45)] dark:border-neutral-700 dark:bg-neutral-800/90"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                        {order.order_number}
                      </h2>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        {getOrderStatusDescription(order.status)}
                      </p>
                    </div>

                    <div className="md:text-right">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getOrderStatusClasses(order.status)}`}
                      >
                        {order.status}
                      </span>
                      <p className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
                        RWF {order.total_amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {totalItems} items
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <span>Progress</span>
                      <span>
                        {Math.round(getOrderProgressPercent(order.status))}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-full rounded-full ${
                          order.status === "cancelled"
                            ? "bg-red-500 dark:bg-red-600"
                            : "bg-blue-600 dark:bg-blue-700"
                        }`}
                        style={{
                          width: `${getOrderProgressPercent(order.status)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900/30">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      <ShoppingBag size={16} />
                      Ordered Items
                    </div>
                    <div className="space-y-3">
                      {(order.items || []).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.product_name}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            RWF {item.subtotal.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/orders/${order.id}#progress`)}
                      className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
                    >
                      <Eye size={18} />
                      Track Order
                    </button>
                    <button
                      onClick={() => navigate("/")}
                      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 dark:border-neutral-600 dark:text-stone-300 dark:hover:bg-neutral-700"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
