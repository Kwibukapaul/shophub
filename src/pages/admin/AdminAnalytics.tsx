import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Analytics {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('7days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      let query = supabase.from('sales_analytics').select('*').order('date', { ascending: false });

      if (timeRange === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.gte('date', sevenDaysAgo.toISOString().split('T')[0]);
      } else if (timeRange === '30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAnalytics(
        (data || []).map((item) => ({
          date: item.date,
          totalOrders: item.total_orders,
          totalRevenue: item.total_revenue,
          totalCost: item.total_cost,
          profit: item.profit,
        }))
      );
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const totals = analytics.reduce(
    (acc, item) => ({
      orders: acc.orders + item.totalOrders,
      revenue: acc.revenue + item.totalRevenue,
      cost: acc.cost + item.totalCost,
      profit: acc.profit + item.profit,
    }),
    { orders: 0, revenue: 0, cost: 0, profit: 0 }
  );

  const StatCard = ({ label, value, trend, isMoney }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{label}</p>
      <div className="flex items-end gap-4">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isMoney ? `RWF ${value.toLocaleString()}` : value.toLocaleString()}
        </h3>
        {trend && (
          <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span className="text-sm font-bold">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
        <div className="flex gap-2">
          {(['7days', '30days', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                timeRange === range
                  ? 'bg-blue-600 dark:bg-blue-700 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Orders" value={totals.orders} trend={12} />
            <StatCard label="Total Revenue" value={totals.revenue} isMoney trend={25} />
            <StatCard label="Total Cost" value={totals.cost} isMoney trend={-5} />
            <StatCard label="Profit" value={totals.profit} isMoney trend={18} />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Daily Sales Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Orders</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Revenue</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Cost</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Profit</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    analytics.map((item) => {
                      const margin =
                        item.totalRevenue > 0
                          ? ((item.profit / item.totalRevenue) * 100).toFixed(1)
                          : '0';
                      return (
                        <tr key={item.date} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.totalOrders}</td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                            RWF {item.totalRevenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            RWF {item.totalCost.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">
                            RWF {item.profit.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{margin}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}