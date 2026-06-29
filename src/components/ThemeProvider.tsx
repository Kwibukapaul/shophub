/**
 * ThemeProvider Component
 *
 * Provides centralized theme management with light/dark mode support
 * Integrates with existing ThemeContext
 */

import { ReactNode, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: "light" | "dark";
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { isDark } = useTheme();

  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, [isDark]);

  return <>{children}</>;
}

export default ThemeProvider;
