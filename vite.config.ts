import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base './' so the static build works from any path (e.g. GitHub Pages)
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { include: ['tests/**/*.test.ts'] },
});
