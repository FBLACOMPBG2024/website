import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["selector", '[data-mode="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      textShadow: {
        sm: "0 0 2px var(--tw-shadow-color)", // No offset, small blur
        DEFAULT: "0 0 4px var(--tw-shadow-color)", // No offset, default blur
        lg: "0 0 16px var(--tw-shadow-color)", // No offset, large blur
        xl: "0 0 24px var(--tw-shadow-color)", // No offset, extra-large blur
        xxl: "0 0 32px var(--tw-shadow-color)", // No offset, extra-extra-large blur
      },
      colors: {
        background: "rgba(var(--background))",
        backgroundGray: "rgba(var(--background-gray))",
        backgroundGrayLight: "rgba(var(--background-gray-light))",
        backgroundGreen: "rgba(var(--background-green))",
        backgroundSecondary: "rgba(var(--background-secondary))",
        text: "rgba(var(--text))",
        primary: "rgba(var(--primary))",
        secondary: "rgba(var(--secondary))",
        accent: "rgba(var(--accent))",
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") }
      );
    }),
  ],
};
export default config;
