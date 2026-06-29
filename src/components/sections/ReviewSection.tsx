import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "../../lib/animationPresets";

interface Review {
  id: string;
  author: string;
  rating: number;
  body: string;
  created_at?: string;
}

interface ReviewSectionProps {
  reviews?: Review[];
}

export default function ReviewSection({ reviews = [] }: ReviewSectionProps) {
  const [expanded, setExpanded] = useState(false);
  if (reviews.length === 0) return null;

  return (
    <motion.section
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
      className="mt-8"
    >
      <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        Reviews
      </h3>
      <div className="space-y-4">
        {reviews.slice(0, expanded ? reviews.length : 3).map((r) => (
          <div
            key={r.id}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {r.author}
                </div>
                <div className="inline-flex items-center gap-1 text-yellow-500">
                  <Star size={14} />
                  <span className="text-sm font-medium">
                    {r.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {r.created_at?.split("T")[0]}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {r.body}
            </p>
          </div>
        ))}

        {reviews.length > 3 && (
          <button
            onClick={() => setExpanded((s) => !s)}
            className="text-sm text-primary-600 dark:text-primary-400"
          >
            {expanded ? "Show less" : `View all ${reviews.length} reviews`}
          </button>
        )}
      </div>
    </motion.section>
  );
}
