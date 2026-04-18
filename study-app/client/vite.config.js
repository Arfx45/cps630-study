import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/cps630-study/',
  server: {
    port: 5173,
  },
});
