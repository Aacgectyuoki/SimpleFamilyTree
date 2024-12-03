// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [
//     require("@tailwindcss/forms"),
//     require("@tailwindcss/typography"),
//   ],
// }

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all React components
    "./public/index.html",       // Include the main HTML file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};


// module.exports = {
//   corePlugins: {
//     preflight: true, // Ensure Tailwind's base styles are enabled
//   },
//   content: ['./src/**/*.{js,jsx,ts,tsx}'], // Ensure Tailwind processes your React files
// };
