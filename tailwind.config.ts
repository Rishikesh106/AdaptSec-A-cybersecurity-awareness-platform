import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#05070e",
          card: "#0b111e",
          cardHover: "#111a2e",
          border: "#182438",
          primary: "#00f0ff",
          secondary: "#00ff88",
          accent: "#ff007f",
          warning: "#ffb703",
          danger: "#ff3366",
          muted: "#8899ac"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"]
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "scan-line": "scanLine 4s linear infinite"
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 15px rgba(0, 240, 255, 0.4))" },
          "50%": { opacity: "0.8", filter: "drop-shadow(0 0 5px rgba(0, 240, 255, 0.2))" }
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" }
        }
      }
    },
  },
  plugins: [],
};
export default config;
