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
        "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm";
    } else if (variant === "interactive") {
      variantClasses =
        "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm cursor-pointer transition-all duration-300";
    } else if (variant === "hover") {
      variantClasses =
        "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300";
    }

    return (
      <div
        ref={ref}
        className={`
          rounded-lg p-4 md:p-6
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
