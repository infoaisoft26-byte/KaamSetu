import type { Config } from "tailwindcss";
const config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { ink: "#14231f", forest: "#176b52", mint: "#eaf5ef", sand: "#f7f7f2" }, boxShadow: { soft: "0 14px 40px rgba(20,35,31,.08)" } } }, plugins: [] };
export default config;
