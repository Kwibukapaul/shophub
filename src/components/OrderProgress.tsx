import React from "react";
import type { Order } from "../types";
import {
  getOrderProgressPercent,
  getOrderStatusDescription,
  getOrderStatusClasses,
} from "../lib/orderProgress";

interface Props {
  order: Order;
}

export default function OrderProgress({ order }: Props) {
  const percent = getOrderProgressPercent(order.status);
  const desc = getOrderStatusDescription(order.status);
  const statusClasses = getOrderStatusClasses(order.status);

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${statusClasses}`}
          >
            {order.status.toUpperCase()}
          </span>
          <div className="text-sm text-gray-600 dark:text-gray-300">{desc}</div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {Math.round(percent)}%
        </div>
      </div>

      <div className="w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all dark:bg-blue-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
