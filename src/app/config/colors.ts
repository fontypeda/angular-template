// Define the color palette that will be used by both PrimeNG and Tailwind
type ColorShades = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

export const primaryColors: ColorShades = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
  950: '#1e1b4b',
};

export const secondaryColors: ColorShades = {
  50: '#e6faf4',
  100: '#ccf5e9',
  200: '#99ead3',
  300: '#66e0bd',
  400: '#33d5a7',
  500: '#00c78c',
  600: '#009f70',
  700: '#007754',
  800: '#004f38',
  900: '#00271c',
  950: '#001410',
};

// Theme colors for both light and dark modes
export const themeColors = {
  background: {
    light: '#ffffff',
    dark: '#1e1e1e',
  },
  surface: {
    light: '#f8f9fa',
    dark: '#2d2d2d',
  },
  text: {
    light: '#1e1e1e',
    dark: '#ffffff',
  },
};
