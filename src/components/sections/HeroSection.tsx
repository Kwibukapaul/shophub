import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  fadeInUpVariants,
  staggerContainerVariants,
  buttonPressVariants,
} from "../../lib/animationPresets";
import StyledButton from "../ui/StyledButton";

interface HeroSectionProps {
  onStartShopping: () => void;
  onBrowseProducts: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
  isAuthenticated: boolean;
}

export default function HeroSection({
  onStartShopping,
  onBrowseProducts,
  onSignIn,
  onSignUp,
  isAuthenticated,
}: HeroSectionProps) {
  return (
    <motion.section
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="mb-12"
    >
      <motion.div
        variants={fadeInUpVariants}
        className="relative overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.25),_transparent_35%),linear-gradient(135deg,_#1f2937_0%,_#3f2d1f_38%,_#d97706_100%)] p-8 shadow-[0_40px_90px_-35px_rgba(15,23,42,0.6)] md:p-10 lg:p-12"
      >
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 45%)",
          }}
        />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="max-w-2xl">
            <motion.div
              variants={fadeInUpVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle2 size={16} />
              </motion.div>
              Curated shopping, thoughtfully presented
            </motion.div>

            <motion.h1
              variants={fadeInUpVariants}
              className="text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl"
            >
              Discover calm, beautiful shopping for everyday life.
            </motion.h1>

            <motion.p
              variants={fadeInUpVariants}
              className="mt-6 max-w-xl text-lg leading-8 text-white/85"
            >
              ShopHub brings together quality products, partner stores, and a
              smooth customer experience designed to feel effortless from first
              click to checkout.
            </motion.p>

            <motion.div
              variants={fadeInUpVariants}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <motion.div
                variants={buttonPressVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <StyledButton
                  variant="primary"
                  size="lg"
                  onClick={isAuthenticated ? onStartShopping : onSignUp}
                  className="w-full bg-white text-stone-800 hover:bg-stone-100 sm:w-auto"
                >
                  {isAuthenticated ? "Start Shopping" : "Sign Up"}
                  {!isAuthenticated && <ArrowRight size={16} />}
                </StyledButton>
              </motion.div>

              <motion.button
                variants={buttonPressVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={isAuthenticated ? onBrowseProducts : onSignIn}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15"
              >
                {isAuthenticated ? "Browse Products" : "Sign In"}
                <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          </div>

          <motion.div
            variants={fadeInUpVariants}
            className="rounded-[28px] border border-white/20 bg-white/15 p-5 text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-white/90">
              <Sparkles size={14} /> Featured highlights
            </div>
            <div className="space-y-3">
              {[
                { icon: ShieldCheck, label: "Secure checkout" },
                { icon: Truck, label: "Fast local delivery" },
                { icon: Sparkles, label: "Curated new arrivals" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3"
                  >
                    <div className="rounded-full bg-white/20 p-2">
                      <Icon size={16} />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
