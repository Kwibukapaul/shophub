import type { Order } from "../types";

export const orderProgressStatuses: Array<Order["status"]> = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

export const getOrderProgressIndex = (status: Order["status"]) =>
  orderProgressStatuses.indexOf(status);

export const getOrderProgressPercent = (status: Order["status"]) => {
  if (status === "cancelled") {
    return 100;
  }

  const index = getOrderProgressIndex(status);
  if (index < 0) {
    return 0;
  }

  return ((index + 1) / orderProgressStatuses.length) * 100;
};

export const getOrderStatusDescription = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "We received your order and it is waiting for review.";
    case "confirmed":
      return "Your order has been confirmed and queued for preparation.";
    case "processing":
      return "Your items are being prepared right now.";
    case "shipped":
      return "Your order is on the way to you.";
    case "delivered":
      return "Your order has been delivered successfully.";
    case "cancelled":
      return "This order was cancelled before delivery.";
    default:
      return "We are updating your order.";
  }
};

export const getOrderStatusClasses = (status: Order["status"]) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "confirmed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "processing":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
    case "shipped":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};
