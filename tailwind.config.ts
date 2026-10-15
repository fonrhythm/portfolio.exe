import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    // 色板即规范：黑底（近黑）+ 米白纸 + 文件夹四色；不含 #000 / #FFF / 纯灰
    colors: {
      transparent: "transparent",
      night: "#0B0B0C",
      paper: "#E8E6E0",
      "paper-light": "#F2F0EA",
      ink: "#151515",
      "ink-soft": "#55534E",
      cover: "#1D3C97",
      blue: "#1B5FD8",
      "blue-soft": "#5A92F2",
      events: "#C3281D",
      social: "#1E6B47",
      projects: "#77756F",
      others: "#2D5FC4",
      stamp: "#B23A24",
    },
    borderRadius: { none: "0", paper: "2px", btn: "4px" },
    fontFamily: {
      cap: ["Roboto", '"Noto Sans SC"', "sans-serif"],
      didone: ['"Playfair Display"', '"Noto Serif SC"', "serif"],
      serif: ['"Cormorant Garamond"', '"Noto Serif SC"', "Georgia", "serif"],
    },
    extend: {},
  },
  plugins: [],
};
export default config;
