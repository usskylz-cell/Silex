import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#FAF8F5",
        muted: { DEFAULT: "#8B8B8B", foreground: "#111111" },
        line: "#ECECE8",
        chip: "#F2F1ED",
        accent: { DEFAULT: "#111111", foreground: "#FFFFFF" },
        card: { DEFAULT: "#FFFFFF", foreground: "#111111" },
        background: "var(--background)",
        foreground: "var(--foreground)",
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--foreground)" },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        "chart-4": "var(--chart-4)",
        "chart-5": "var(--chart-5)",
        sidebar: { DEFAULT: "var(--sidebar)", foreground: "var(--sidebar-foreground)" },
        "sidebar-primary": "var(--sidebar-primary)",
        "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
        "sidebar-accent": "var(--sidebar-accent)",
        "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
        "sidebar-border": "var(--sidebar-border)",
        "sidebar-ring": "var(--sidebar-ring)",
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
