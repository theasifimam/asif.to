import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const COLORS = {
  primary: '#00D084', // Modern Dribbble Green
  primarySoft: '#E6FBF3', // Soft mint for card/pill backgrounds
  primaryMedium: '#B1F2D6', // Subtle border green
  primaryDark: '#008060', // Deep emerald for text accents
  secondary: '#1A1A1A', 
  tertiary: '#8D8D8D', 
  background: '#FFFFFF', 
  card: '#F8FCFA', // Very subtle minty card background
  border: '#EAF4EF', // Softer green-tinted borders
  destructive: '#FF3B30', 
  rating: '#FFD700', 
  text: '#000000',
  subtext: '#8D8D8D',
  accent: '#E6FBF3', // Unified soft green accent
};

export const DARK_COLORS = {
  primary: '#00D084', 
  primarySoft: '#1A2F25', // Deep dark mint for dark mode cards
  primaryMedium: '#233830', // Deep muted green for dark mode borders
  primaryDark: '#00D084', // Vibrant green for text accents in dark mode
  secondary: '#EAEAEA', 
  tertiary: '#A0A0A0', 
  background: '#121212', 
  card: '#1E2421', // Dark emerald-tinted cards
  border: '#2D3631', 
  destructive: '#FF453A', 
  rating: '#FFD700', 
  text: '#FFFFFF',
  subtext: '#A0A0A0',
  accent: '#1A2F25', 
};

export const useAppTheme = () => {
  const themePreference = useSelector((state: RootState) => state.theme.preference);
  const systemTheme = useColorScheme();
  
  const isDark = 
    themePreference === 'dark' || 
    (themePreference === 'system' && systemTheme === 'dark');
    
  return {
    isDark,
    themePreference,
    colors: isDark ? DARK_COLORS : COLORS,
  };
};

export const SIZES = {
  h1: 32,
  h2: 24,
  h3: 18,
  bodyRegular: 14,
  bodySmall: 12,
  radiusCard: 20,
  radiusButton: 30,
  radiusPill: 16,
  paddingHorizontal: 20,
};

export const SHADOWS = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  deep: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
};
