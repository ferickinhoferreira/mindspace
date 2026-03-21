/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["Inter", "var(--font-display)", "sans-serif"],
      },
      colors: {
        bg: {
          base:        "#000000",
          elevated:    "#0d0d0d",
          surface:     "#111111",
          overlay:     "#161616",
          border:      "#2f2f2f",
          "border-subtle": "#1e1e1e",
          secondary:   "#111111",
        },
        brand: {
          DEFAULT: "#7c6af7",
          dim:     "#5b52d6",
          alt:     "#e040fb",
          glow:    "rgba(124, 106, 247, 0.15)",
        },
        text: {
          primary:   "#ffffff",
          secondary: "#a0a0a0",
          muted:     "#555555",
        },
      },
      animation: {
        "fade-in":   "fadeIn 0.35s ease forwards",
        "slide-up":  "slideUp 0.35s ease forwards",
        "slide-in":  "slideIn 0.25s ease forwards",
        "scale-in":  "scaleIn 0.25s ease forwards",
        "like-pop":  "likePop 0.35s ease forwards",
        "shimmer":   "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        likePop: {
          "0%":   { transform: "scale(1)" },
          "30%":  { transform: "scale(1.35)" },
          "60%":  { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "from": { backgroundPosition: "-200% 0" },
          "to":   { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7c6af7, #e040fb)",
        "story-gradient": "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
      },
      boxShadow: {
        brand:  "0 4px 20px rgba(124,106,247,0.35)",
        "brand-lg": "0 8px 40px rgba(124,106,247,0.4)",
      },
    },
  },
  plugins: [],
}
