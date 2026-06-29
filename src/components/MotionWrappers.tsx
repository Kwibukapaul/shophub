/**
 * Motion-enabled wrapper components
 * Provides convenient ways to add Framer Motion animations to UI components
 */

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fadeInVariants,
  fadeInUpVariants,
  scaleInVariants,
  slideInLeftVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "../lib/animationPresets";

interface MotionWrapperProps {
  children: ReactNode;
  delay?: number;
}

export function FadeInMotion({ children, delay = 0 }: MotionWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function FadeInUpMotion({ children, delay = 0 }: MotionWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeInUpVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleInMotion({ children, delay = 0 }: MotionWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleInVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function SlideInLeftMotion({ children, delay = 0 }: MotionWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideInLeftVariants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainerVariants}
      transition={{ staggerChildren: staggerDelay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: MotionWrapperProps) {
  return <motion.div variants={staggerItemVariants}>{children}</motion.div>;
}

interface AnimatePresenceWrapperProps {
  children: ReactNode;
}

export function AnimatePresenceWrapper({
  children,
}: AnimatePresenceWrapperProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {children}
    </AnimatePresence>
  );
}
