import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabase";
import DashboardCard from "../components/ui/DashboardCard";
import { ShoppingCart, Clock } from "lucide-react";
import { usePersistentQuery } from "../hooks/usePersistentQuery";

export default function UserDashboard() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const ordersQuery = usePersistentQuery<any[]>({
    queryKey: `user-orders:${session?.user.id || "guest"}`,
    enabled: Boolean(session?.user.id),
    staleTimeMs: 30 * 1000,
    initialData: [],
    fetcher: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, total_amount, status, created_at")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    setOrders(ordersQuery.data || []);
    setLoading(ordersQuery.isLoading);
  }, [ordersQuery.data, ordersQuery.isLoading]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your recent activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Recent Orders"
          value={orders.length}
          icon={ShoppingCart}
        >
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            See your latest orders and track their status.
          </p>
        </DashboardCard>
        <DashboardCard
          title="Pending Items"
          value={orders.filter((o) => o.status === "pending").length}
          icon={Clock}
        >
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Items awaiting confirmation or payment.
          </p>
        </DashboardCard>
        <DashboardCard
          title="Total Spent"
          value={`RWF ${orders.reduce((s, o) => s + (o.total_amount || 0), 0).toLocaleString()}`}
        >
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Total spent across your orders.
          </p>
        </DashboardCard>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Recent Orders
        </h2>
        {loading ? (
          <div className="py-8 text-center text-gray-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            You have no orders yet.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 6).map((o) => (
              <div
                key={o.id}
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded"
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {o.order_number || o.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(o.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  RWF {o.total_amount?.toLocaleString() || 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
