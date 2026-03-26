import { useState } from "react";
import { ChevronLeft } from "lucide-react";

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
  setOrderId: (id: string) => void;
}

export default function CheckoutPage({
  onNavigate,
  setOrderId,
}: CheckoutPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    deliveryType: "delivery",
    paymentMethod: "mobile_money",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setOrderId("sample-order-id");
      onNavigate("order-confirmation");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate("cart")}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 font-medium"
        >
          <ChevronLeft size={20} />
          Back to Cart
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Delivery Options
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="delivery"
                      checked={formData.deliveryType === "delivery"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryType: e.target.value,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-900 dark:text-white">
                      Home Delivery (RWF 5,000)
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="pickup"
                      checked={formData.deliveryType === "pickup"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryType: e.target.value,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-900 dark:text-white">
                      Pickup from Store (Free)
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="mobile_money"
                      checked={formData.paymentMethod === "mobile_money"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-900 dark:text-white">
                      Mobile Money (MoMo)
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="credit_card"
                      checked={formData.paymentMethod === "credit_card"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-900 dark:text-white">
                      Credit Card
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="e_wallet"
                      checked={formData.paymentMethod === "e_wallet"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-900 dark:text-white">
                      E-Wallet
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition font-bold disabled:opacity-50"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 h-fit border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>RWF 50,000</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>RWF 9,000</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {formData.deliveryType === "delivery" ? "RWF 5,000" : "Free"}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>
                RWF {formData.deliveryType === "delivery" ? "64,000" : "59,000"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
