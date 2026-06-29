import { ReactNode, HTMLAttributes, forwardRef } from "react";

interface StyledBadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "error"
    | "info";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  children: ReactNode;
}

export const StyledBadge = forwardRef<HTMLDivElement, StyledBadgeProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    let variantClasses = "";

    if (variant === "primary") {
      variantClasses =
        "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300";
    } else if (variant === "secondary") {
      variantClasses =
        "bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300";
    } else if (variant === "accent") {
      variantClasses =
        "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300";
    } else if (variant === "success") {
      variantClasses =
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    } else if (variant === "warning") {
      variantClasses =
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    } else if (variant === "error") {
      variantClasses =
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    } else if (variant === "info") {
      variantClasses =
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }

    let sizeClasses = "";
    if (size === "sm") {
      sizeClasses = "px-2 py-1 text-xs gap-1";
    } else if (size === "md") {
      sizeClasses = "px-2.5 py-1.5 text-sm gap-1.5";
    } else if (size === "lg") {
      sizeClasses = "px-3 py-2 text-base gap-2";
    }

    return (
      <div
        ref={ref}
        className={`
          inline-flex items-center font-medium rounded-full
          ${variantClasses}
          ${sizeClasses}
          ${className}
        `}
        {...props}
      >
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
      </div>
    );
  },
);

StyledBadge.displayName = "StyledBadge";

export default StyledBadge;
