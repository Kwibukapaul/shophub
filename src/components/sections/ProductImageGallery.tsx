import Carousel from "../..//components/Carousel";
import { motion } from "framer-motion";
import { fadeInUpVariants } from "../../lib/animationPresets";

interface ProductImageGalleryProps {
  images: string[];
}

export default function ProductImageGallery({
  images,
}: ProductImageGalleryProps) {
  const items = (images && images.length > 0 ? images : ["/"]).map(
    (src, i) => ({
      id: `img-${i}`,
      image: src || "/",
      title: undefined,
    }),
  );

  return (
    <motion.div variants={fadeInUpVariants} initial="hidden" animate="visible">
      <Carousel items={items} />
    </motion.div>
  );
}
