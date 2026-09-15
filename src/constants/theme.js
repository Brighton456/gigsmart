import { Platform } from 'react-native';

// Theme file with a variety of colors for the app
// This implements the requirement for "blue, white theme + other blended multiple colors, over 50 colors used"

// Primary color palette
export const colors = {
  // Primary brand colors
  primary: '#0055cc',
  primaryLight: '#2376e6',
  primaryDark: '#003a8c',
  
  // Secondary brand colors
  secondary: '#5e35b1',
  secondaryLight: '#7c4dff',
  secondaryDark: '#4527a0',
  
  // Essential UI colors
  white: '#ffffff',
  black: '#000000',
  
  // Background gradient colors
  gradientBlue1: '#001f3f',
  gradientBlue2: '#0a57cf',
  gradientBlue3: '#1e90ff',
  gradientPurple1: '#4a148c',
  gradientPurple2: '#7b1fa2',
  gradientPurple3: '#9c27b0',
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#e1f5fe',
  textMuted: '#90caf9',
  textDark: '#212121',
  
  // Status colors
  success: '#00c853',
  warning: '#ffd600',
  error: '#d50000',
  info: '#00b0ff',
  
  // Accent colors
  accent1: '#ff6d00',
  accent2: '#00bfa5',
  accent3: '#d500f9',
  accent4: '#ffab00',
  accent5: '#ff5252',
  
  // Gray scale
  gray100: '#f5f5f5',
  gray200: '#eeeeee',
  gray300: '#e0e0e0',
  gray400: '#bdbdbd',
  gray500: '#9e9e9e',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Blue scale
  blue100: '#e3f2fd',
  blue200: '#bbdefb',
  blue300: '#90caf9',
  blue400: '#64b5f6',
  blue500: '#42a5f5',
  blue600: '#2196f3',
  blue700: '#1976d2',
  blue800: '#1565c0',
  blue900: '#0d47a1',
  
  // Additional color variations to meet the "over 50 colors" requirement
  indigo: '#3f51b5',
  purple: '#9c27b0',
  deepPurple: '#673ab7',
  pink: '#e91e63',
  red: '#f44336',
  orange: '#ff9800',
  deepOrange: '#ff5722',
  amber: '#ffc107',
  yellow: '#ffeb3b',
  lime: '#cddc39',
  green: '#4caf50',
  lightGreen: '#8bc34a',
  teal: '#009688',
  cyan: '#00bcd4',
  lightBlue: '#03a9f4',
  brown: '#795548',
  blueGray: '#607d8b',
};

// Opacity variations for even more color combinations
export const opacity = {
  5: 0.05,
  10: 0.1,
  20: 0.2,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  80: 0.8,
  90: 0.9,
  95: 0.95,
};

// Font sizes
export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  heading1: 24,
  heading2: 22,
  heading3: 20,
  heading4: 18,
  heading5: 16,
  heading6: 14,
};

// Responsive font sizes
export const responsiveFontSizes = {
  xs: { small: 10, medium: 11, large: 12 },
  sm: { small: 11, medium: 12, large: 13 },
  md: { small: 13, medium: 14, large: 15 },
  lg: { small: 15, medium: 16, large: 17 },
  xl: { small: 17, medium: 18, large: 19 },
  xxl: { small: 19, medium: 20, large: 22 },
  heading1: { small: 22, medium: 24, large: 28 },
  heading2: { small: 20, medium: 22, large: 24 },
  heading3: { small: 18, medium: 20, large: 22 },
  heading4: { small: 16, medium: 18, large: 20 },
  heading5: { small: 15, medium: 16, large: 18 },
  heading6: { small: 14, medium: 15, large: 16 },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// Responsive spacing
export const responsiveSpacing = {
  xs: { small: 3, medium: 4, large: 4 },
  sm: { small: 6, medium: 8, large: 10 },
  md: { small: 12, medium: 16, large: 20 },
  lg: { small: 18, medium: 24, large: 30 },
  xl: { small: 24, medium: 32, large: 40 },
  xxl: { small: 30, medium: 40, large: 48 },
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

const createShadow = ({ boxShadow, offset, opacity, radius, elevation }) => (
  Platform.select({
    web: {
      boxShadow,
    },
    default: {
      shadowColor: colors.black,
      shadowOffset: offset,
      shadowOpacity: opacity,
      shadowRadius: radius,
      elevation,
    },
  })
);

// Shadows
export const shadows = {
  sm: createShadow({
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.18)',
    offset: { width: 0, height: 1 },
    opacity: 0.18,
    radius: 1.0,
    elevation: 1,
  }),
  md: createShadow({
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.22)',
    offset: { width: 0, height: 2 },
    opacity: 0.22,
    radius: 2.22,
    elevation: 3,
  }),
  lg: createShadow({
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.30)',
    offset: { width: 0, height: 4 },
    opacity: 0.30,
    radius: 4.65,
    elevation: 8,
  }),
  xl: createShadow({
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.44)',
    offset: { width: 0, height: 8 },
    opacity: 0.44,
    radius: 10.32,
    elevation: 16,
  }),
};

// Gradient presets
export const gradients = {
  primary: [colors.gradientBlue1, colors.gradientBlue2, colors.gradientBlue3],
  secondary: [colors.gradientPurple1, colors.gradientPurple2, colors.gradientPurple3],
  success: [colors.green, colors.lightGreen, colors.lime],
  error: [colors.red, colors.deepOrange, colors.orange],
  warning: [colors.amber, colors.yellow, colors.orange],
  info: [colors.lightBlue, colors.cyan, colors.teal],
  dark: [colors.gray900, colors.gray800, colors.gray700],
  light: [colors.gray100, colors.white, colors.blue100],
  purple: [colors.deepPurple, colors.purple, colors.pink],
  sunset: [colors.deepOrange, colors.red, colors.pink],
  ocean: [colors.blue, colors.lightBlue, colors.cyan],
  forest: [colors.green, colors.teal, colors.lightGreen],
};

// Animation timings
export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
};
