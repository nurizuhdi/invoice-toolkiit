import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { toolkiit: { DEFAULT: "#6B7A2F", dark: "#566325", light: "#e6ebd2" } } } },
  plugins: [],
};
export default config;
