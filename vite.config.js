import { defineConfig } from 'vite';

export default defineConfig({
  root: '.', // Root of your project
  publicDir: 'public', // Static assets folder
  build: {
    outDir: 'dist', // Output directory for production build
    assetsDir: 'assets', // Directory for compiled assets
  },
  server: {
    port: 5173, // Dev server port
  },
});

