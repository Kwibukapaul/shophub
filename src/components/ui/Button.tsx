import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold focus:outline-none";
  const variantClass =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : variant === "secondary"
        ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        : "bg-transparent text-gray-700 hover:bg-gray-100";

  return (
    <button {...props} className={`${base} ${variantClass} ${className}`} />
  );
}
