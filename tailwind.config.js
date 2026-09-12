/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Tajawal", "system-ui", "sans-serif"], display: ["Cairo", "Tajawal", "sans-serif"] },
      colors: {
        brand: { 50:"#eef6ff",100:"#d9ecff",200:"#bcdcff",300:"#8ec6ff",400:"#59a5ff",500:"#3182f6",600:"#1e63db",650:"#1a56c0",700:"#1a4db0",800:"#1c418c",900:"#1c3a71" },
        sand: { 50:"#faf7f2",100:"#f2ece1",200:"#e5d9c5" }
      },
      boxShadow: { soft: "0 1px 2px rgba(16,24,40,.04), 0 8px 24px -12px rgba(16,24,40,.18)" }
    }
  },
  plugins: []
};
