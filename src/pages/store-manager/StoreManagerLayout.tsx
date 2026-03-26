import { useState } from "react";
import { UserProfile } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";

import {
  BarChart3,
  Package,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import StoreManagerDashboard from "./StoreManagerDashboard";
import StoreManagerProducts from "./StoreManagerProducts";

interface StoreManagerLayoutProps {
  userProfile: UserProfile | null;
  storeId: string | null;
  onLogout: () => void;
}

export default function StoreManagerLayout({
  userProfile,
  storeId,
  onLogout,
}: StoreManagerLayoutProps) {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
  ];

  if (!storeId) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 pb-20">
        <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent mb-4">Store Manager Access Suspended</h1>
            <p className="text-gray-500 mb-8 max-w-sm">It seems you have not been assigned to a store yet. Please contact an admin.</p>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 mx-auto bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white transition-all duration-300 overflow-hidden shadow-xl`}
      >
        <div className="p-6 border-b border-gray-700 dark:border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent whitespace-nowrap">
            Store Manager
          </h1>
          <p className="text-xs text-gray-400 mt-1">Management Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  currentPage === item.id
                    ? "bg-blue-600 dark:bg-blue-700 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-800/50"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700 dark:border-gray-800 mt-auto w-64">
          <div className="text-sm text-gray-300 mb-4 truncate">
            <p className="font-medium">{userProfile?.full_name || "Manager"}</p>
            <p className="text-xs text-gray-500">Store Manager</p>
          </div>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-800/50 rounded-lg transition mb-2"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {menuItems.find((item) => item.id === currentPage)?.label}
          </h2>
          <div></div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {currentPage === "dashboard" && <StoreManagerDashboard storeId={storeId} />}
          {currentPage === "products" && <StoreManagerProducts storeId={storeId} />}
        </div>
      </div>
    </div>
  );
}
