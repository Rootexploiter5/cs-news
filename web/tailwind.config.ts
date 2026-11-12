import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        black: "#000000",
        void: {
          950: "#030303",
          900: "#080808",
          850: "#0d0d0d",
          800: "#141414",
          750: "#1c1c1c",
          700: "#262626",
          600: "#3d3d3d",
        },
        cyber: {
          cyan: "#00f0ff",
          neon: "#00ff9f",
          purple: "#9d4edd",
          crimson: "#ff0055",
          amber: "#ffaa00",
        },
      },
      keyframes: {
        gradientFlow: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.65", transform: "scale(1.1)" },
        },
        auroraRotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "gradient-flow": "gradientFlow 6s ease infinite",
        "gradient-flow-slow": "gradientFlow 10s ease infinite",
        "gradient-flow-fast": "gradientFlow 3.5s ease infinite",
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
        "aurora": "auroraRotate 25s linear infinite",
      },
      backgroundSize: {
        "300%": "300% 300%",
        "200%": "200% 200%",
      },
    },
  },
  plugins: [],
};

export default config;
