import { ChevronLeft, Eye } from "lucide-react";

interface OrderHistoryProps {
  onNavigate: (page: string) => void;
  setOrderId: (id: string) => void;
}

export default function OrderHistory({
  onNavigate,
  setOrderId,
}: OrderHistoryProps) {
  const handleViewOrder = (orderId: string) => {
    setOrderId(orderId);
    onNavigate("order-tracking");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 font-medium"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Order History
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 dark:text-white">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    #ORD-001
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    2024-12-18
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                    RWF 64,000
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold">
                      Processing
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleViewOrder("ORD-001")}
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      <Eye size={18} />
                      Track
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
