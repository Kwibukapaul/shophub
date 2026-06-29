import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  fadeInUpVariants,
  staggerContainerVariants,
  buttonPressVariants,
} from "../../lib/animationPresets";
import StyledButton from "../ui/StyledButton";

interface HeroSectionProps {
  onStartShopping: () => void;
  onBrowseProducts: () => void;
  isAuthenticated: boolean;
}

export default function HeroSection({
  onStartShopping,
  onBrowseProducts,
  isAuthenticated,
}: HeroSectionProps) {
  return (
    <motion.section
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="mb-12"
    >
      {/* Main Hero Card */}
      <motion.div
        variants={fadeInUpVariants}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 p-10 md:p-12 lg:p-16 shadow-2xl"
      >
        {/* Animated Background Shapes */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 max-w-2xl">
          {/* Badge */}
          <motion.div
            variants={fadeInUpVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-white"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle2 size={16} />
            </motion.div>
            Welcome to a better way to shop online
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeInUpVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
          >
            Find products faster, shop with confidence
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeInUpVariants}
            className="mt-6 text-lg text-white/90 leading-relaxed max-w-xl"
          >
            ShopHub helps you discover quality products, compare options easily,
            and enjoy a clean, reliable shopping experience. Browse essentials
            or find something new.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUpVariants}
            className="mt-8 flex flex-col sm:flex-row gap-4"
          >
            <motion.div
              variants={buttonPressVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <StyledButton
                variant="primary"
                size="lg"
                onClick={onStartShopping}
                className="bg-white text-primary-600 hover:bg-white/90 w-full sm:w-auto"
              >
                {isAuthenticated ? "Start Shopping" : "Create Account"}
                <ArrowRight size={16} />
              </StyledButton>
            </motion.div>

            <motion.button
              variants={buttonPressVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={onBrowseProducts}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-white/30 text-white font-semibold hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm group"
            >
              Browse Products
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRight size={16} />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
