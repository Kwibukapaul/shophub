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
      className="group rounded-[24px] border border-stone-200/80 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_24px_80px_-30px_rgba(15,23,42,0.45)] dark:border-neutral-700 dark:bg-neutral-800/90"
    >
      <motion.div
        className="inline-flex rounded-2xl bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 p-3 dark:from-amber-900/40 dark:via-orange-900/20 dark:to-rose-900/20"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.08, rotate: 4 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Icon className="text-amber-600 dark:text-amber-300" size={24} />
      </motion.div>

      <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-400">
        {description}
      </p>

      <motion.div
        className="mt-4 h-0.5 w-0 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-12 transition-all duration-300"
        initial={{ width: 0 }}
        whileHover={{ width: 48 }}
      />
    </motion.div>
  );
}
