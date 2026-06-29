import { motion } from "framer-motion";
import { fadeInUpVariants } from "../../lib/animationPresets";
import { Order } from "../../types";
import { getOrderProgressPercent } from "../../lib/orderProgress";

interface Props {
  order: Order;
}

export default function OrderHistoryTimeline({ order }: Props) {
  const percent = getOrderProgressPercent(order.status);

  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
    >
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              Order Progress
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {order.order_number}
            </p>
          </div>
          <div className="text-sm font-bold">{Math.round(percent)}%</div>
        </div>
        <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
