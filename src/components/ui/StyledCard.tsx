import { ReactNode, HTMLAttributes, forwardRef } from "react";

interface StyledCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "hover";
  children: ReactNode;
}

export const StyledCard = forwardRef<HTMLDivElement, StyledCardProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    let variantClasses = "";

    if (variant === "default") {
      variantClasses =
        "bg-white/95 dark:bg-neutral-800/90 border border-stone-200/80 dark:border-neutral-700 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]";
    } else if (variant === "interactive") {
      variantClasses =
        "bg-white/95 dark:bg-neutral-800/90 border border-stone-200/80 dark:border-neutral-700 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] cursor-pointer transition-all duration-300";
    } else if (variant === "hover") {
      variantClasses =
        "bg-white/95 dark:bg-neutral-800/90 border border-stone-200/80 dark:border-neutral-700 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] hover:shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] hover:-translate-y-1 transition-all duration-300";
    }

    return (
      <div
        ref={ref}
        className={`
          rounded-[24px] p-4 md:p-6
          ${variantClasses}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  },
);

StyledCard.displayName = "StyledCard";

export default StyledCard;
