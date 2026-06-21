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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Icon className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
