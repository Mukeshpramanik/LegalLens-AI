/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          500: '#1e3a8a', // Primary Navy
          600: '#1e293b', // Dark Slate
          700: '#0f172a',
        },
        risk: {
          low: '#15803d',
          medium: '#b45309',
          high: '#b91c1c',
        },
      },
    },
  },
  plugins: [],
};
