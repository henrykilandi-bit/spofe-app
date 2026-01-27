import React from 'react';
import { useTheme } from '@/hooks/useTheme';

/**
 * ThemeToggle Component
 * Button to toggle between light and dark mode
 */
export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        relative p-2 rounded-lg transition-all duration-200
        ${isDarkMode 
          ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-slate-900
      `}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
    >
      {isDarkMode ? (
        <span className="text-xl transition-transform duration-300">☀️</span>
      ) : (
        <span className="text-xl transition-transform duration-300">🌙</span>
      )}
    </button>
  );
}

export default ThemeToggle;
