import { motion } from "framer-motion";
import { fadeInUpVariants } from "../../lib/animationPresets";

interface CheckoutStepsProps {
  step: number;
}

export default function CheckoutSteps({ step = 1 }: CheckoutStepsProps) {
  const steps = ["Shipping", "Payment", "Review"];

  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
      className="mb-6"
    >
      <div className="flex items-center gap-4">
        {steps.map((s, idx) => {
          const active = idx + 1 === step;
          const completed = idx + 1 < step;
          return (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`h-10 w-10 flex items-center justify-center rounded-full font-bold ${completed ? "bg-green-600 text-white" : active ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600"}`}
              >
                {idx + 1}
              </div>
              <div>
                <div
                  className={`text-sm font-semibold ${active ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
                >
                  {s}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
