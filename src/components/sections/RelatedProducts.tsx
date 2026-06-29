import { motion } from "framer-motion";
import ProductCard from "../ProductCard";
import {
  staggerContainerVariants,
  staggerItemVariants,
} from "../../lib/animationPresets";
import { Product } from "../../types";

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({
  products = [],
}: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <motion.section
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      className="mt-10"
    >
      <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
        Related Products
      </h3>
      <motion.div
        className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
        variants={staggerContainerVariants}
      >
        {products.map((p, idx) => (
          <motion.div
            variants={staggerItemVariants}
            key={p.id}
            transition={{ delay: idx * 0.03 }}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
