import { motion } from "framer-motion";
import StyledCard from "../ui/StyledCard";
import { fadeInUpVariants } from "../../lib/animationPresets";

interface Props {
  subtotal: number;
  tax: number;
  shippingText: string;
  total: number;
  onCheckout: () => void;
}

export default function CartSummaryCard({
  subtotal,
  tax,
  shippingText,
  total,
  onCheckout,
}: Props) {
  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
    >
      <StyledCard>
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          Order Summary
        </h3>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
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
            <span>{shippingText}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-lg font-bold text-gray-900 dark:text-white mb-4">
          <span>Total</span>
          <span>RWF {total.toLocaleString()}</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full rounded-lg bg-blue-600 py-3 text-white font-bold hover:bg-blue-700"
        >
          Proceed to Checkout
        </button>
      </StyledCard>
    </motion.div>
  );
}
