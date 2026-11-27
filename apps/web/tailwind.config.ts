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
        canvas: "#F6F7F9",
        surface: "#FFFFFF",
        subtle: "#F0F2F5",
        border: {
          DEFAULT: "#E2E5EA",
          strong: "#CBD2D9",
        },
        ink: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#64748B",
        },
        brand: {
          DEFAULT: "#1E3A8A",
          hover: "#172554",
          tint: "#EFF6FF",
          border: "#BFDBFE",
        },
        risk: {
          high: "#DC2626",
          medium: "#D97706",
          low: "#15803D",
        },
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        popover: "0 4px 12px -2px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
