import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Package, TrendingUp } from "lucide-react";

export default function StoreManagerDashboard({
  storeId,
}: {
  storeId: string;
}) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
    itemsSold: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [storeId]);

  const fetchStats = async () => {
    try {
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .eq("partner_store_id", storeId);

      if (error) throw error;

      if (products) {
        // Compute basic product stats
        const totalProducts = products.length;
        const activeProducts = products.filter((p) => p.is_active).length;
        const lowStock = products.filter((p) => p.stock_quantity < 10).length;

        // If there are products, fetch order_items for those product ids
        let itemsSold = 0;
        let totalOrders = 0;
        let recentOrders: any[] = [];

        const productIds = products.map((p: any) => p.id).filter(Boolean);
        if (productIds.length > 0) {
          const { data: orderItems, error: oiErr } = await supabase
            .from("order_items")
            .select("*, orders(*)")
            .in("product_id", productIds as any[])
            .order("created_at", { ascending: false });

          if (!oiErr && orderItems) {
            itemsSold = orderItems.reduce(
              (sum: number, oi: any) => sum + (oi.quantity || 0),
              0,
            );
            const orderIds = Array.from(
              new Set(orderItems.map((oi: any) => oi.order_id)),
            );
            totalOrders = orderIds.length;

            // build recent orders list from orderItems grouping
            const ordersMap: Record<string, any> = {};
            orderItems.forEach((oi: any) => {
              if (!ordersMap[oi.order_id]) {
                ordersMap[oi.order_id] = oi.orders;
                ordersMap[oi.order_id].items = [];
              }
              ordersMap[oi.order_id].items.push({
                product_id: oi.product_id,
                quantity: oi.quantity,
                subtotal: oi.subtotal,
                name: oi.product_name,
              });
            });

            recentOrders = Object.values(ordersMap).slice(0, 5);
          }
        }

        setStats({
          totalProducts,
          activeProducts,
          lowStock,
          itemsSold,
          totalOrders,
        });
        setRecentOrders(recentOrders);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const statCards = [
    {
      title: "Store Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
      description: "Total products in your store",
    },
    {
      title: "Active Products",
      value: stats.activeProducts,
      icon: TrendingUp,
      color: "bg-green-500",
      description: "Products currently visible to users",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      icon: Package,
      color: "bg-orange-500",
      description: "Products with less than 10 items",
    },
    {
      title: "Items Sold",
      value: stats.itemsSold,
      icon: TrendingUp,
      color: "bg-indigo-500",
      description: "Total items sold from your store",
    },
    {
      title: "Orders",
      value: stats.totalOrders,
      icon: Package,
      color: "bg-teal-500",
      description: "Unique orders containing your products",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Store Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${stat.color} bg-opacity-10 dark:bg-opacity-20`}
                >
                  <Icon
                    className={`${stat.color.replace("bg-", "text-")} dark:brightness-125`}
                    size={24}
                  />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stat.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>
      {recentOrders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Orders (with your products)
          </h2>
          <div className="space-y-4">
            {recentOrders.map((o, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {o.order_number || o.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Items: {o.items?.length ?? 0}
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  {o.items?.map((it: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span>{it.name}</span>
                      <span className="font-medium">x{it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
