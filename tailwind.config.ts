import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#0b1220',
        surface: '#121b2d'
      }
    }
  },
  plugins: []
};

export default config;
