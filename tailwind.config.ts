import { type Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Colores de theme.ts
        primary: {
          DEFAULT: '#0a4890', // #0a4890 (polynesian_blue DEFAULT)
          light: '#bcd9fa', // #bcd9fa (polynesian_blue-900)
          dark: '#0f6ad2', // #0f6ad2 (polynesian_blue-600)
          foreground: '#ffffff', // White text for primary backgrounds
        },
        secondary: {
          DEFAULT: '#0b78d1', // #0b78d1 (french_blue DEFAULT)
          light: '#c8e5fc', // #c8e5fc (french_blue-900)
          dark: '#2295f3', // #2295f3 (french_blue-600)
          foreground: '#ffffff', // White text for secondary backgrounds
        },
        tertiary: {
          DEFAULT: '#45a6f5', // #45a6f5 (argentinian_blue DEFAULT)
          light: '#daedfd', // #daedfd (argentinian_blue-900)
          dark: '#6cb8f7', // #6cb8f7 (argentinian_blue-600)
        },
        background: '#d0e7f8', // #d0e7f8 (columbia_blue DEFAULT)
        foreground: '#111111', // #111111
        muted: '#e6f2fd', // #e6f2fd (maya_blue-900)
        mutedForeground: '#6B7280', // #6B7280
        border: '#cce6fb', // #cce6fb (maya_blue-800)
        success: '#10B981', // #10B981
        warning: '#F59E0B', // #F59E0B
        error: '#EF4444', // #EF4444
        info: '#3B82F6', // #3B82F6
        
        // Additional shadcn color tokens
        card: '#ffffff',
        'card-foreground': '#111111',
        popover: '#ffffff',
        'popover-foreground': '#111111',
        destructive: '#EF4444',
        'destructive-foreground': '#ffffff',
        accent: '#e6f2fd',
        'accent-foreground': '#111111',
        ring: '#0a4890',

        // Nueva paleta completa como colores personalizados
        polynesian_blue: {
          DEFAULT: '#0a4890',
          100: '#020e1d',
          200: '#041d39',
          300: '#062b56',
          400: '#083a72',
          500: '#0a4890',
          600: '#0f6ad2',
          700: '#378ef1',
          800: '#79b3f6',
          900: '#bcd9fa',
        },
        french_blue: {
          DEFAULT: '#0b78d1',
          100: '#02182a',
          200: '#043053',
          300: '#07487d',
          400: '#0960a7',
          500: '#0b78d1',
          600: '#2295f3',
          700: '#59b0f6',
          800: '#91caf9',
          900: '#c8e5fc',
        },
        argentinian_blue: {
          DEFAULT: '#45a6f5',
          100: '#03223c',
          200: '#064578',
          300: '#0967b4',
          400: '#0d8af0',
          500: '#45a6f5',
          600: '#6cb8f7',
          700: '#91caf9',
          800: '#b5dcfb',
          900: '#daedfd',
        },
        maya_blue: {
          DEFAULT: '#80bff4',
          100: '#062845',
          200: '#0c5189',
          300: '#1279ce',
          400: '#3c9eee',
          500: '#80bff4',
          600: '#9acdf6',
          700: '#b3d9f8',
          800: '#cce6fb',
          900: '#e6f2fd',
        },
        columbia_blue: {
          DEFAULT: '#d0e7f8',
          100: '#0c324f',
          200: '#18649e',
          300: '#3094e0',
          400: '#7fbdec',
          500: '#d0e7f8',
          600: '#d8ebf9',
          700: '#e2f0fb',
          800: '#ebf5fc',
          900: '#f5fafe',
        },
      },
    },
  },
  plugins: [],
};

export default config;
