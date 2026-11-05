import { useTheme } from './ThemeContext';

export interface AppThemeColors {
  primary: string;
  background: string;
  surfaceCard: string;
  surfaceElevated: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
}

export const useAppTheme = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors: AppThemeColors = {
    primary: '#339F45',
    background: isDark ? '#000000' : '#FFFFFF',
    surfaceCard: isDark ? '#121212' : '#FFFFFF',
    surfaceElevated: isDark ? '#171717' : '#F4F4F5',
    border: isDark ? '#222222' : '#E2E8F0',
    textPrimary: isDark ? '#FFFFFF' : '#09090B',
    textSecondary: isDark ? '#A1A1AA' : '#52525B',
  };

  return {
    isDark,
    theme,
    colors,
  };
};

export default useAppTheme;
