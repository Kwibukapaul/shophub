/**
 * UI Component Exports
 * Centralized exports for easy component imports
 */

// Styled Components
export { default as StyledButton } from './ui/StyledButton';
export { default as StyledCard } from './ui/StyledCard';
export { default as StyledBadge } from './ui/StyledBadge';
export { default as DashboardCard } from './ui/DashboardCard';
export { default as CategoryTile } from './ui/CategoryTile';
export { default as Layout } from './ui/Layout';

// Motion Wrappers
export {
  FadeInMotion,
  FadeInUpMotion,
  ScaleInMotion,
  SlideInLeftMotion,
  StaggerContainer,
  StaggerItem,
  AnimatePresenceWrapper,
} from './MotionWrappers';

// Theme
export { ThemeProvider } from './ThemeProvider';

// Other Components
export { default as Navigation } from './Navigation';
export { default as Footer } from './Footer';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as Toasts } from './Toasts';
export { default as WhatsAppChat } from './WhatsAppChat';
export { default as AuthGate } from './AuthGate';
