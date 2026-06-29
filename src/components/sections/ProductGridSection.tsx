import { motion } from "framer-motion";
import { Category, Product } from "../../types";
import ProductCard from "../ProductCard";
import StyledButton from "../ui/StyledButton";
import {
  staggerContainerVariants,
  staggerItemVariants,
} from "../../lib/animationPresets";

interface ProductGridSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  categories: Category[];
  isLoading?: boolean;
  selectedCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  showCategoryFilter?: boolean;
}

export default function ProductGridSection({
  title,
  subtitle,
  products,
  categories,
  isLoading = false,
  selectedCategory,
  onCategoryChange,
  showCategoryFilter = true,
}: ProductGridSectionProps) {
  return (
    <motion.section
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="mb-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 md:p-8 shadow-lg"
    >
      {/* Header */}
      <motion.div variants={staggerItemVariants} className="mb-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
            Featured
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 max-w-2xl text-base leading-6 text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </motion.div>

      {/* Category Filter */}
      {showCategoryFilter && (
        <motion.div
          variants={staggerItemVariants}
          className="mb-8 flex flex-wrap gap-3"
        >
          <StyledButton
            variant={!selectedCategory ? "primary" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(null)}
            className="whitespace-nowrap"
          >
            All Products
          </StyledButton>

          {categories.map((category) => (
            <StyledButton
              key={category.id}
              variant={
                selectedCategory === category.slug ? "primary" : "outline"
              }
              size="sm"
              onClick={() => onCategoryChange(category.slug)}
              className="whitespace-nowrap"
            >
              {category.name}
            </StyledButton>
          ))}
        </motion.div>
      )}

      {/* Products Grid */}
      {isLoading && products.length === 0 ? (
        <motion.div
          variants={staggerItemVariants}
          className="py-12 text-center text-gray-500 dark:text-gray-400"
        >
          <div className="inline-flex flex-col items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"
            />
            <span>Loading products...</span>
          </div>
        </motion.div>
      ) : products.length === 0 ? (
        <motion.div
          variants={staggerItemVariants}
          className="py-12 text-center text-gray-500 dark:text-gray-400"
        >
          No products found for this category yet.
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              variants={staggerItemVariants}
              transition={{ delay: idx * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.section>
  );
}
