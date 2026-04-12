import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabase";
import { CartItem, Product, UserAddress } from "../types";
import { usePersistentQuery } from "../hooks/usePersistentQuery";
import { getFriendlyErrorMessage } from "../lib/errorHandling";
import { useCartStore } from "../stores/useCartStore";
import { useToastStore } from "../stores/useToastStore";

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
  setOrderId: (id: string) => void;
}

type CheckoutDraft = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  deliveryType: "delivery" | "pickup";
  paymentMethod: "mobile_money" | "credit_card" | "e_wallet";
};

type CartRow = CartItem & { product: Product | null };

type PlaceOrderResult = {
  order_id: string;
  order_number: string;
};

type CreatedOrderRow = {
  id: string;
  order_number: string;
};

const emptyDraft: CheckoutDraft = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  deliveryType: "delivery",
  paymentMethod: "mobile_money",
};

const getDraftKey = (userId: string) => `checkout-draft:${userId}`;

const generateOrderNumber = () => {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const randomPart = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
};

export default function CheckoutPage({
  onNavigate,
  setOrderId,
}: CheckoutPageProps) {
  const { session, userProfile } = useAuth();
  const clearCart = useCartStore((state) => state.clearCart);
  const [formData, setFormData] = useState<CheckoutDraft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const cartQuery = usePersistentQuery<CartRow[]>({
    queryKey: `checkout-cart:${session?.user.id || "guest"}`,
    enabled: Boolean(session?.user.id),
    staleTimeMs: 15 * 1000,
    fallbackError: "Unable to load checkout items.",
    initialData: [],
    fetcher: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("*, product:products(*)")
        .eq("user_id", session!.user.id);

      if (error) {
        throw error;
      }

      return (data || []) as CartRow[];
    },
  });

  const addressQuery = usePersistentQuery<UserAddress | null>({
    queryKey: `default-shipping-address:${session?.user.id || "guest"}`,
    enabled: Boolean(session?.user.id),
    staleTimeMs: 5 * 60 * 1000,
    fallbackError: "Unable to load your saved address.",
    initialData: null,
    fetcher: async () => {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", session!.user.id)
        .eq("type", "shipping")
        .order("is_default", { ascending: false })
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      return data?.[0] ?? null;
    },
  });

  useEffect(() => {
    if (!session?.user.id) {
      return;
    }

    try {
      const raw = window.localStorage.getItem(getDraftKey(session.user.id));
      if (raw) {
        const savedDraft = JSON.parse(raw) as CheckoutDraft;
        setFormData(savedDraft);
        return;
      }
    } catch (error) {
      console.warn("Failed to restore checkout draft:", error);
    }

    const savedAddress = addressQuery.data;

    if (savedAddress) {
      setFormData((previous) => {
        if (
          previous.fullName ||
          previous.phone ||
          previous.address ||
          previous.city
        ) {
          return previous;
        }

        return {
          ...previous,
          fullName: savedAddress.full_name,
          phone: savedAddress.phone,
          address: savedAddress.street_address,
          city: savedAddress.city,
        };
      });
      return;
    }

    if (userProfile) {
      setFormData((previous) => {
        if (previous.fullName || previous.phone) {
          return previous;
        }

        return {
          ...previous,
          fullName: userProfile.full_name || "",
          phone: userProfile.phone || "",
        };
      });
    }
  }, [addressQuery.data, session?.user.id, userProfile]);

  useEffect(() => {
    if (!session?.user.id) {
      return;
    }

    window.localStorage.setItem(
      getDraftKey(session.user.id),
      JSON.stringify(formData),
    );
  }, [formData, session?.user.id]);

  const cartItems = cartQuery.data || [];
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );
  const tax = subtotal * 0.18;
  const shipping = formData.deliveryType === "delivery" ? 5000 : 0;
  const total = subtotal + tax + shipping;

  const placeOrderWithoutRpc = async (): Promise<PlaceOrderResult> => {
    if (!session?.user.id) {
      throw new Error("Authentication required to place an order.");
    }

    const userId = session.user.id;
    let shippingAddressId: string | null = null;

    if (formData.deliveryType === "delivery") {
      const { error: clearDefaultsError } = await supabase
        .from("user_addresses")
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("type", "shipping");

      if (clearDefaultsError) {
        throw clearDefaultsError;
      }

      const { data: addressRow, error: addressError } = await supabase
        .from("user_addresses")
        .insert({
          user_id: userId,
          type: "shipping",
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          street_address: formData.address.trim(),
          city: formData.city.trim(),
          is_default: true,
        })
        .select("id")
        .single();

      if (addressError) {
        throw addressError;
      }

      shippingAddressId = addressRow.id;
    }

    const orderNumber = generateOrderNumber();
    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId,
        subtotal,
        tax,
        shipping_fee: shipping,
        total_amount: total,
        status: "pending",
        payment_method: formData.paymentMethod,
        payment_status: "pending",
        delivery_type: formData.deliveryType,
        shipping_address_id: shippingAddressId,
        pickup_location:
          formData.deliveryType === "pickup"
            ? "Main partner pickup point"
            : null,
      })
      .select("id, order_number")
      .single<CreatedOrderRow>();

    if (orderError) {
      throw orderError;
    }

    const validCartItems = cartItems.filter((item) => item.product);
    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(
        validCartItems.map((item) => ({
          order_id: orderRow.id,
          product_id: item.product!.id,
          product_name: item.product!.name,
          product_price: item.product!.price,
          quantity: item.quantity,
          subtotal: (item.product!.price || 0) * item.quantity,
        })),
      );

    if (orderItemsError) {
      throw orderItemsError;
    }

    const { error: clearCartError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (clearCartError) {
      throw clearCartError;
    }

    return {
      order_id: orderRow.id,
      order_number: orderRow.order_number,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!session?.user.id) {
      onNavigate("login");
      return;
    }

    if (cartItems.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const { data, error } = await supabase.rpc("place_order_from_cart", {
        p_full_name: formData.fullName,
        p_phone: formData.phone,
        p_address: formData.address,
        p_city: formData.city,
        p_delivery_type: formData.deliveryType,
        p_payment_method: formData.paymentMethod,
        p_pickup_location:
          formData.deliveryType === "pickup"
            ? "Main partner pickup point"
            : null,
      });

      if (error) {
        const message = error.message || "";

        if (
          message.includes("Could not find the function") ||
          message.includes("place_order_from_cart")
        ) {
          const fallbackResult = await placeOrderWithoutRpc();
          cartQuery.clear();
          clearCart();
          window.localStorage.removeItem(getDraftKey(session.user.id));
          setOrderId(fallbackResult.order_id);
          return;
        }

        throw error;
      }

      const result = (
        Array.isArray(data) ? data[0] : data
      ) as PlaceOrderResult | null;

      if (!result?.order_id) {
        throw new Error("Order was created without a valid response.");
      }

      cartQuery.clear();
      clearCart();
      window.localStorage.removeItem(getDraftKey(session.user.id));

      // show a toast notification with order number and action
      useToastStore.getState().push({
        id: `order-${result.order_id}`,
        message: `Order placed: ${result.order_number}`,
        duration: 8000,
        onClick: () => {
          // navigate to order confirmation/tracking when clicked
          window.location.href = `/order-confirmation/${result.order_id}`;
        },
      });

      setOrderId(result.order_id);
    } catch (error) {
      console.error("Checkout failed:", error);
      setSubmitError(
        getFriendlyErrorMessage(error, "Unable to place your order."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate("cart")}
          className="mb-8 flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ChevronLeft size={20} />
          Back to Cart
        </button>

        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Checkout
          </h1>
          {cartQuery.isFetching && cartItems.length > 0 && (
            <span className="text-sm text-gray-500">Refreshing...</span>
          )}
        </div>

        {(cartQuery.error || addressQuery.error || submitError) && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {submitError || cartQuery.error || addressQuery.error}
          </div>
        )}

        {cartQuery.isLoading && cartItems.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
            Loading checkout data...
          </div>
        ) : cartItems.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow dark:bg-gray-800 dark:text-gray-300">
            Your cart is empty. Add products before checking out.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
                  <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                    Shipping Address
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          fullName: event.target.value,
                        })
                      }
                      className="col-span-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:col-span-2"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(event) =>
                        setFormData({ ...formData, phone: event.target.value })
                      }
                      className="col-span-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:col-span-2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={formData.address}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          address: event.target.value,
                        })
                      }
                      className="col-span-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:col-span-2"
                      required={formData.deliveryType === "delivery"}
                      disabled={formData.deliveryType === "pickup"}
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(event) =>
                        setFormData({ ...formData, city: event.target.value })
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      required={formData.deliveryType === "delivery"}
                      disabled={formData.deliveryType === "pickup"}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
                  <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                    Delivery Options
                  </h2>
                  <div className="space-y-3">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        value="delivery"
                        checked={formData.deliveryType === "delivery"}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            deliveryType: event.target
                              .value as CheckoutDraft["deliveryType"],
                          })
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-gray-900 dark:text-white">
                        Home Delivery (RWF 5,000)
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="radio"
                        value="pickup"
                        checked={formData.deliveryType === "pickup"}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            deliveryType: event.target
                              .value as CheckoutDraft["deliveryType"],
                          })
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-gray-900 dark:text-white">
                        Pickup from Store (Free)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
                  <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                    Payment Method
                  </h2>
                  <div className="space-y-3">
                    {[
                      { value: "mobile_money", label: "Mobile Money (MoMo)" },
                      { value: "credit_card", label: "Credit Card" },
                      { value: "e_wallet", label: "E-Wallet" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-3"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={formData.paymentMethod === option.value}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              paymentMethod: event.target
                                .value as CheckoutDraft["paymentMethod"],
                            })
                          }
                          className="h-4 w-4"
                        />
                        <span className="text-gray-900 dark:text-white">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {submitting ? "Processing..." : "Place Order"}
                </button>
              </form>
            </div>

            <div className="h-fit rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/50">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Order Summary
              </h2>
              <div className="mb-4 space-y-4 border-b border-gray-200 pb-4 dark:border-gray-700">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span>
                      {item.product?.name || "Product"} x{item.quantity}
                    </span>
                    <span>
                      RWF{" "}
                      {(
                        (item.product?.price || 0) * item.quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>RWF {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>RWF {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0
                      ? "Free"
                      : `RWF ${shipping.toLocaleString()}`}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>RWF {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
