import { useThemeStore } from '@/context/ThemeContext';

/**
 * Custom hook to access theme functionality
 * @returns {Object} Theme state and methods
 */
export const useTheme = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  const setDarkMode = useThemeStore((state) => state.setDarkMode);

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
  };
};

export default useTheme;
