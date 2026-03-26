import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  getFriendlyErrorMessage,
  offlineMessage,
} from "../../lib/errorHandling";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  Star,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    productsSold: 0,
    totalReviews: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isOnline = useOnlineStatus();

  useEffect(() => {
    fetchStats();
  }, [isOnline]);

  const fetchStats = async () => {
    if (!isOnline) {
      setError(offlineMessage);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, total_amount, status, created_at");
      if (ordersError) throw ordersError;

      const { data: usersData, error: usersError } = await supabase
        .from("user_profiles")
        .select("id");
      if (usersError) throw usersError;

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, stock_quantity")
        .eq("is_active", true);
      if (productsError) throw productsError;

      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from("order_items")
        .select("quantity");
      if (orderItemsError) throw orderItemsError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("product_reviews")
        .select("id");
      if (reviewsError) throw reviewsError;

      const deliveredOrders = (ordersData || []).filter(
        (o) => o.status === "delivered",
      );
      const totalRevenue = deliveredOrders.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0,
      );
      const productsSold = (orderItemsData || []).reduce(
        (sum, item) => sum + (item.quantity || 0),
        0,
      );

      setStats({
        totalOrders: ordersData?.length || 0,
        totalUsers: usersData?.length || 0,
        totalProducts: productsData?.length || 0,
        totalRevenue,
        productsSold,
        totalReviews: reviewsData?.length || 0,
      });

      const recent = (ordersData || [])
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )
        .slice(0, 5);
      setRecentOrders(recent);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError(
        getFriendlyErrorMessage(error, "Unable to load dashboard data."),
      );
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === "number" && value > 1000
              ? `RWF ${(value / 1000).toFixed(1)}K`
              : value}
          </h3>
        </div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Icon className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
          <TrendingUp size={16} />
          <span>{change}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to ShopHub Admin Panel
        </p>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex gap-3">
            <AlertCircle
              className="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400"
              size={20}
            />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
          {isOnline && (
            <button
              onClick={fetchStats}
              className="rounded-lg border border-red-300 px-3 py-1 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={ShoppingCart}
            />
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
            />
            <StatCard
              title="Active Products"
              value={stats.totalProducts}
              icon={Package}
            />
            <StatCard
              title="Total Revenue"
              value={`RWF ${stats.totalRevenue.toLocaleString()}`}
              icon={TrendingUp}
            />
            <StatCard
              title="Products Sold"
              value={stats.productsSold}
              icon={ShoppingCart}
            />
            <StatCard
              title="Total Reviews"
              value={stats.totalReviews}
              icon={Star}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Recent Orders
              </h2>
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                    No orders yet
                  </p>
                ) : (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          RWF {order.total_amount?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === "delivered"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : order.status === "processing"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                            : order.status === "pending"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <button className="w-full text-left p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition font-medium text-blue-600 dark:text-blue-400">
                  + Add New Product
                </button>
                <button className="w-full text-left p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition font-medium text-blue-600 dark:text-blue-400">
                  + Add New Category
                </button>
                <button className="w-full text-left p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition font-medium text-blue-600 dark:text-blue-400">
                  View Pending Reviews
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
