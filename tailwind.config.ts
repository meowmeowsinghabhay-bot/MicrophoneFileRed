import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fdecea",
          100: "#f9c5c0",
          200: "#f49a92",
          300: "#ef6e64",
          400: "#eb5349",
          500: "#d32f2f",
          600: "#d32f2f",
          700: "#b71c1c",
          800: "#961818",
          900: "#7f1414",
        },
        card: {
          blue: { light: "#dbeafe", dark: "#1e3a5f" },
          pink: { light: "#fce7f3", dark: "#4a1942" },
          yellow: { light: "#fef3c7", dark: "#422006" },
          purple: { light: "#ede9fe", dark: "#2e1065" },
          green: { light: "#dcfce7", dark: "#14532d" },
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04)",
        "card-dark": "0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 4px 12px rgba(211, 47, 47, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
