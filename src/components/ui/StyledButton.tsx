import { ReactNode, ButtonHTMLAttributes, forwardRef } from "react";

interface StyledButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const StyledButton = forwardRef<HTMLButtonElement, StyledButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    // Base styles
    let variantClasses = "";

    if (variant === "primary") {
      variantClasses =
        "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800";
    } else if (variant === "secondary") {
      variantClasses =
        "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-400";
    } else if (variant === "outline") {
      variantClasses =
        "border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100";
    } else if (variant === "ghost") {
      variantClasses =
        "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200";
    } else if (variant === "danger") {
      variantClasses =
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800";
    }

    let sizeClasses = "";
    if (size === "xs") {
      sizeClasses = "px-2.5 py-1.5 text-xs gap-1";
    } else if (size === "sm") {
      sizeClasses = "px-3 py-2 text-sm gap-1.5";
    } else if (size === "md") {
      sizeClasses = "px-4 py-2 text-base gap-2";
    } else if (size === "lg") {
      sizeClasses = "px-6 py-3 text-lg gap-2";
    } else if (size === "xl") {
      sizeClasses = "px-8 py-4 text-lg gap-2";
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg
          transition-all duration-200 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus-ring
          ${variantClasses}
          ${sizeClasses}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {leftIcon && !isLoading && (
          <span className="flex items-center">{leftIcon}</span>
        )}
        {children}
        {rightIcon && <span className="flex items-center">{rightIcon}</span>}
      </button>
    );
  },
);

StyledButton.displayName = "StyledButton";

export default StyledButton;
