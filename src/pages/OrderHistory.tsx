import { ChevronLeft, Eye, ShoppingBag } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Order History
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Track active orders, review ordered items, and keep shopping while
              your deliveries move forward.
            </p>
          </div>
          {ordersQuery.isFetching && orders.length > 0 && (
            <span className="text-sm text-gray-500">Refreshing...</span>
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
          <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
            You have not placed any orders yet.
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
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50"
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
                      <span>{Math.round(getOrderProgressPercent(order.status))}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-full rounded-full ${
                          order.status === "cancelled"
                            ? "bg-red-500 dark:bg-red-600"
                            : "bg-blue-600 dark:bg-blue-700"
                        }`}
                        style={{ width: `${getOrderProgressPercent(order.status)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900/30">
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
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      <Eye size={18} />
                      Track Order
                    </button>
                    <button
                      onClick={() => navigate("/")}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
