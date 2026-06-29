import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cardHoverVariants } from "../../lib/animationPresets";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function FeatureCard({
  title,
  description,
  icon: Icon,
}: FeatureCardProps) {
  return (
    <motion.div
      variants={cardHoverVariants}
      initial="initial"
      whileInView="hover"
      viewport={{ once: true, margin: "-100px" }}
      className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-lg hover:shadow-2xl transition-shadow"
    >
      {/* Icon Container */}
      <motion.div
        className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Icon className="text-primary-600 dark:text-primary-400" size={24} />
      </motion.div>

      {/* Title */}
      <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
        {description}
      </p>

      {/* Accent Line */}
      <motion.div
        className="mt-4 h-0.5 w-0 bg-gradient-to-r from-primary-600 to-secondary-600 group-hover:w-12 transition-all duration-300"
        initial={{ width: 0 }}
        whileHover={{ width: 48 }}
      />
    </motion.div>
  );
}
