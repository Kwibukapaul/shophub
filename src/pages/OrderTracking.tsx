import { ChevronLeft } from "lucide-react";

interface OrderTrackingProps {
  onNavigate: (page: string) => void;
}

export default function OrderTracking({ onNavigate }: OrderTrackingProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate("order-history")}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 font-medium"
        >
          <ChevronLeft size={20} />
          Back to Orders
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Order Tracking
          </h1>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-8">
            <p className="text-blue-900 dark:text-blue-300">
              Track your order status and delivery updates. We'll keep you
              notified every step of the way.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-bold mb-4">
                  ✓
                </div>
                <div className="w-1 h-16 bg-blue-600 dark:bg-blue-700"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                  Order Confirmed
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  2024-12-18 10:30 AM
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center font-bold mb-4">
                  ✓
                </div>
                <div className="w-1 h-16 bg-blue-600 dark:bg-blue-700"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                  Processing
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  2024-12-18 11:45 AM
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 flex items-center justify-center font-bold mb-4">
                  ◷
                </div>
                <div className="w-1 h-16 bg-gray-300 dark:bg-gray-600"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                  Shipped
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Expected: 2024-12-19
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 flex items-center justify-center font-bold mb-4">
                  ◷
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                  Delivered
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Expected: 2024-12-20
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
