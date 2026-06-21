import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "blue" | "green" | "pink" | "slate";
  className?: string;
}

export default function Badge({
  children,
  color = "blue",
  className = "",
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold";
  const colorClass =
    color === "blue"
      ? "bg-blue-600 text-white"
      : color === "green"
        ? "bg-green-600 text-white"
        : color === "pink"
          ? "bg-pink-600 text-white"
          : "bg-slate-100 text-slate-800 dark:bg-gray-700 dark:text-white";

  return (
    <span className={`${base} ${colorClass} ${className}`}>{children}</span>
  );
}
