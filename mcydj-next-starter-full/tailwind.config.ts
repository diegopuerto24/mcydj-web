import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { primary: "#0ea5e9", secondary: "#334155" },
      fontFamily: { sans: ["ui-sans-serif","system-ui","Segoe UI","Roboto","Arial","sans-serif"] },
      borderRadius: { xl: "1rem", "2xl": "1.5rem" }
    }
  },
  plugins: []
};
export default config;
