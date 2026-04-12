import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  getFriendlyErrorMessage,
  offlineMessage,
} from '../../lib/errorHandling';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Order } from '../../types';
import { Eye, Download, AlertCircle, Search } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const isOnline = useOnlineStatus();

  useEffect(() => {
    fetchOrders();
  }, [isOnline]);

  const fetchOrders = async () => {
    if (!isOnline) {
      setError(offlineMessage);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(getFriendlyErrorMessage(err, 'Unable to load orders.'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !statusUpdate) return;
    if (!isOnline) {
      setError(offlineMessage);
      return;
    }

    setError('');
    setMessage('');

    try {
      const { error: updateError } = await supabase.from('orders').update({ status: statusUpdate }).eq('id', selectedOrder.id);

      if (updateError) throw updateError;

      const { error: historyError } = await supabase.from('order_status_history').insert({
        order_id: selectedOrder.id,
        status: statusUpdate,
        note: `Status updated to ${statusUpdate}`,
      });

      if (historyError) throw historyError;

      fetchOrders();
      setSelectedOrder(null);
      setStatusUpdate('');
      setMessage('Order status updated successfully.');
    } catch (err) {
      console.error('Error updating order:', err);
      setError(getFriendlyErrorMessage(err, 'Unable to update the order status.'));
    }
  };

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    const searchableText = [
      order.order_number,
      order.status,
      order.payment_status,
      order.payment_method,
      order.delivery_type,
      order.user_id,
      order.id,
      order.total_amount.toString(),
      order.created_at,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedSearchTerm);
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500 dark:bg-yellow-600',
      confirmed: 'bg-blue-500 dark:bg-blue-600',
      processing: 'bg-blue-500 dark:bg-blue-600',
      shipped: 'bg-purple-500 dark:bg-purple-600',
      delivered: 'bg-green-500 dark:bg-green-600',
      cancelled: 'bg-red-500 dark:bg-red-600',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders Management</h1>
        <button className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium shadow-lg">
          <Download size={18} />
          Export
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-green-700 dark:text-green-300">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" size={20} />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
          {isOnline && (
            <button
              onClick={fetchOrders}
              className="rounded-lg border border-red-300 px-3 py-1 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Search Orders
        </label>
        <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Search size={18} className="text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by order number, status, payment, amount, or user ID"
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">No orders found</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            No orders match "{searchTerm.trim()}".
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 overflow-x-auto border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Date</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Payment</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{order.order_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                    RWF {order.total_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`text-xs font-bold ${order.payment_status === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Update Order Status</h2>

            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Order: {selectedOrder.order_number}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Current Status: {selectedOrder.status}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Amount: RWF {selectedOrder.total_amount.toLocaleString()}</p>
            </div>

            <select
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select New Status</option>
              {statuses
                .filter((status) => status !== selectedOrder.status)
                .map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={handleStatusUpdate}
                disabled={!statusUpdate}
                className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium disabled:opacity-50"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setStatusUpdate('');
                }}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
