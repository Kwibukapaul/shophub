import { CheckCircle, ChevronLeft } from "lucide-react";

interface OrderConfirmationProps {
  orderId: string;
  onNavigate: (page: string) => void;
}

export default function OrderConfirmation({
  orderId,
  onNavigate,
}: OrderConfirmationProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
        <CheckCircle
          className="mx-auto text-green-600 dark:text-green-400 mb-6"
          size={64}
        />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your order has been placed successfully. Order ID:{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {orderId}
          </span>
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You will receive a confirmation email shortly with tracking details.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onNavigate("order-tracking")}
            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-medium"
          >
            Track Order
          </button>
          <button
            onClick={() => onNavigate("home")}
            className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium flex items-center justify-center gap-2"
          >
            <ChevronLeft size={18} />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
