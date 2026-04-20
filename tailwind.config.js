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
          DEFAULT: "#FF6A00",
          10: "#FF6A001A",
          20: "#FF6A0033",
          30: "#FF6A004D",
          40: "#FF6A0066",
          50: "#FF6A0080",
        },
        white: "#FFFFFF",
      },
      boxShadow: {
        orange: "0 2px 8px rgba(255, 106, 0, 0.08)",
        orangeMedium: "0 4px 16px rgba(255, 106, 0, 0.12)",
        orangeStrong: "0 8px 32px rgba(255, 106, 0, 0.16)",
      },
      borderRadius: {
        'brutalist': '2px',
      },
    },
  },
  plugins: [],
};