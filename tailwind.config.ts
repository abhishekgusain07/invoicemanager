import type { Config } from "tailwindcss";

export default {
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
        
        "card-background": "var(--card-background)",
        "card-border": "var(--card-border)",
        "card-hover": "var(--card-hover)",
        
        "muted-foreground": "var(--muted-foreground)",
        
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        
        border: "var(--border)",
        input: "var(--input)",
      },
    },
  },
  plugins: [],
} satisfies Config;
