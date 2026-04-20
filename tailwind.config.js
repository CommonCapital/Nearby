/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
   presets: [require("nativewind/preset")], // ← ADD THIS LINE
  theme: {
    extend: {
      fontFamily: {
        Jakarta: ["Jakarta", "sans-serif"],
        JakartaBold: ["Jakarta-Bold", "sans-serif"],
        JakartaExtraBold: ["Jakarta-ExtraBold", "sans-serif"],
        JakartaExtraLight: ["Jakarta-ExtraLight", "sans-serif"],
        JakartaLight: ["Jakarta-Light", "sans-serif"],
        JakartaMedium: ["Jakarta-Medium", "sans-serif"],
        JakartaSemiBold: ["Jakarta-SemiBold", "sans-serif"],
        JakartaMono: ["monospace"],
      },
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          10: "hsla(var(--primary), 0.1)",
          20: "hsla(var(--primary), 0.2)",
          30: "hsla(var(--primary), 0.3)",
          40: "hsla(var(--primary), 0.4)",
          50: "hsla(var(--primary), 0.5)",
        },
        secondary: "hsl(var(--secondary))",
        flesh: "hsl(var(--background))",
        white: "#FFFFFF",
        surface: "hsl(var(--surface))",
      },
      boxShadow: {
        pulse: "0 4px 20px rgba(var(--glow), 0.3)",
        pulseMedium: "0 8px 32px rgba(var(--glow), 0.4)",
        pulseStrong: "0 12px 48px rgba(var(--glow), 0.8)",
      },
      borderRadius: {
        'brutalist': '2px',
        'organic': '24px',
        'organic-lg': '32px',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
};