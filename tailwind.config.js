/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "rgb(var(--color-primary-brand) / <alpha-value>)",
                "surface": "rgb(var(--color-surface) / <alpha-value>)",
                "panel": "rgb(var(--color-panel) / <alpha-value>)",
                "border-subtle": "var(--color-border-subtle)",
                "brand-teal": "rgb(var(--color-brand-teal) / <alpha-value>)",
                "main": "rgb(var(--color-main) / <alpha-value>)",
                "strong": "rgb(var(--color-text-strong) / <alpha-value>)",
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"],
                "sans": ["Manrope", "sans-serif"],
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
}
