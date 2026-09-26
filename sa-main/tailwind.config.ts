import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#FAF8F5",
        card: "#FFFFFF",
        muted: "#8B8B8B",
        line: "#ECECE8",
        chip: "#F2F1ED",
        accent: "#111111",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "28px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(17,17,17,0.06)",
        float: "0 12px 32px rgba(17,17,17,0.18)",
      },
      maxWidth: {
        app: "420px",
      },
    },
  },
  plugins: [],
};
export default config;
