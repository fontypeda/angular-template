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
    50: '#eef2ff',   // indigo-50
    100: '#e0e7ff',  // indigo-100
    200: '#c7d2fe',  // indigo-200
    300: '#a5b4fc',  // indigo-300
    400: '#818cf8',  // indigo-400
    500: '#6366f1',  // indigo-500
    600: '#4f46e5',  // indigo-600
    700: '#4338ca',  // indigo-700
    800: '#3730a3',  // indigo-800
    900: '#312e81',  // indigo-900
    950: '#1e1b4b'   // indigo-950
};

// Theme colors for both light and dark modes
export const themeColors = {
    background: {
        light: '#ffffff',
        dark: '#1e1e1e'
    },
    surface: {
        light: '#f8f9fa',
        dark: '#2d2d2d'
    },
    text: {
        light: '#1e1e1e',
        dark: '#ffffff'
    }
};
