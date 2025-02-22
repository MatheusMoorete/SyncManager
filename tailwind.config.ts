import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Paleta Principal
        'neutral-cream': '#F5F0E6',
        'terracotta': '#BF6B4F',
        'charcoal': '#2F394D',
        'soft-sage': '#8A9B6E',
        'blush-pink': '#D4A6A6',

        // Paleta Semântica (Ajustada para melhor contraste)
        'success': '#739456', // Mais escuro para melhor contraste
        'error': '#B54343', // Ajustado para WCAG AA
        'warning': '#946C15', // Mais escuro para texto
        'info': '#4A699C', // Mais escuro para melhor contraste

        // Cores do Sistema
        'heading': '#1f2937',
        'text': {
          primary: '#2F394D', // charcoal
          secondary: '#4B5563', // 70% de opacidade visual do charcoal
          muted: '#6B7280', // Para textos menos importantes mas ainda legíveis
        },
        'button': {
          DEFAULT: '#2F394D',
          hover: '#4B5563',
        },

        // Estados e Interações
        'hover': {
          light: 'rgba(47, 57, 77, 0.05)', // charcoal 5%
          medium: 'rgba(47, 57, 77, 0.1)', // charcoal 10%
          strong: 'rgba(47, 57, 77, 0.15)', // charcoal 15%
        },

        // Shadcn UI Colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        heading: ['var(--font-heading)', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
