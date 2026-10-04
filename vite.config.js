import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  esbuild: {
    jsx: 'automatic'
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
