import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<any>;
  children?: React.ReactNode;
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  children,
}: DashboardCardProps) {
  return (
    <div className="rounded-[24px] border border-stone-200 bg-white/95 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:shadow-[0_24px_80px_-28px_rgba(15,23,42,0.4)] dark:border-neutral-700 dark:bg-neutral-800/90">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-bold text-stone-900 dark:text-white">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 p-3 dark:from-amber-900/40 dark:to-orange-900/30">
            <Icon className="text-amber-600 dark:text-amber-300" size={24} />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
