import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dde8ff",
          200: "#c4d4fe",
          300: "#a0b8fd",
          400: "#7b93fa",
          500: "#5b6ef5",
          600: "#4a52e8",
          700: "#3c40cd",
          800: "#3337a5",
          900: "#2d3182",
          950: "#1b1d4d",
        },
        surface: {
          DEFAULT: "#0f1117",
          card: "#161923",
          border: "#1e2433",
          hover: "#1c2236",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
