/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bossBg: "#050509",
        bossBgSoft: "#0b0c11",
        bossCard: "#111219",
        bossStroke: "#242632",
        bossRed: "#e11d2f",
        bossRedSoft: "#b91c1c",
        bossText: "#f9fafb",
        bossTextSoft: "#9ca3af",

        ink: "#f9fafb",
        inkSoft: "#9ca3af",
        stroke: "#242632",
        panelSoft: "#0b0c11",
      },
      boxShadow: {
        boss: "0 22px 60px rgba(0,0,0,0.75)",
      },
      borderRadius: {
        boss: "1rem",
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};