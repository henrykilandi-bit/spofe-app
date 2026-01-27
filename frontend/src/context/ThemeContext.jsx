import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme Store - Manages dark mode and theme preferences
 * Persists theme preference to localStorage
 */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDarkMode: false,

      /**
       * Toggle dark mode on/off
       */
      toggleDarkMode: () => {
        const { isDarkMode } = get();
        const newMode = !isDarkMode;
        set({ isDarkMode: newMode });

        // Apply theme to HTML element
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      /**
       * Set dark mode explicitly
       */
      setDarkMode: (isDark) => {
        set({ isDarkMode: isDark });

        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      /**
       * Initialize theme from system preference or saved preference
       */
      initializeTheme: () => {
        // Check if user has a saved preference
        if (typeof window !== 'undefined') {
          const savedTheme = localStorage.getItem('spofe-theme');

          if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            set({ isDarkMode: true });
          } else if (savedTheme === 'light') {
            document.documentElement.classList.remove('dark');
            set({ isDarkMode: false });
          } else {
            // Use system preference
            const prefersDark = window.matchMedia(
              '(prefers-color-scheme: dark)'
            ).matches;
            if (prefersDark) {
              document.documentElement.classList.add('dark');
              set({ isDarkMode: true });
            }
          }
        }
      },
    }),
    {
      name: 'spofe-theme-store',
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

/**
 * Theme Provider Component - Wraps app with theme context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
/* eslint-disable-next-line react/prop-types */
export function ThemeProvider({ children }) {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  // Initialize theme on mount
  React.useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return <>{children}</>;
}

export default useThemeStore;
