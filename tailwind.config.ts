import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        espresso: {
          950: "#0d0b09",
          900: "#120f0d",
          DEFAULT: "#171310",
          800: "#171310",
          700: "#221c17",
          600: "#2d251f",
          500: "#3d322b",
          400: "#57483e",
        },
        ivory: {
          50: "#FAF7F2",
          DEFAULT: "#F5F0E8",
          100: "#F5F0E8",
          200: "#EDE4D5",
          300: "#E0D2BC",
          400: "#CFC0A7",
          500: "#B8A589",
        },
        gold: {
          50: "#FBF7F0",
          100: "#F5ECD9",
          200: "#EAD7B0",
          300: "#DFC187",
          DEFAULT: "#C6A36A",
          400: "#C6A36A",
          500: "#B08A4D",
          600: "#8E6C34",
          700: "#6B5023",
        },
        forest: {
          900: "#141f19",
          DEFAULT: "#26382E",
          800: "#26382E",
          700: "#344c3e",
          600: "#446251",
          500: "#567b66",
        },
        copper: {
          DEFAULT: "#A66B45",
          600: "#8B5432",
          500: "#A66B45",
          400: "#BE815B",
          300: "#D49C78",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-plus-jakarta)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "gold-glow": "0 0 25px -5px rgba(198, 163, 106, 0.25)",
        "gold-glow-lg": "0 0 40px -5px rgba(198, 163, 106, 0.35)",
        "espresso-deep": "0 20px 40px -15px rgba(13, 11, 9, 0.7)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gold-gradient": "linear-gradient(135deg, #DFCA9E 0%, #C6A36A 50%, #9B7637 100%)",
        "espresso-gradient": "linear-gradient(180deg, #1f1915 0%, #171310 100%)",
        "dark-card": "linear-gradient(145deg, rgba(34, 28, 23, 0.8) 0%, rgba(23, 19, 16, 0.95) 100%)",
        "gold-shimmer": "linear-gradient(90deg, rgba(198,163,106,0.1) 0%, rgba(198,163,106,0.3) 50%, rgba(198,163,106,0.1) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
