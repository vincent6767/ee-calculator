/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    // Node 22+ ships a built-in global `localStorage` that shadows jsdom's
    // implementation but lacks e.g. `.clear()` — disable it so jsdom's wins.
    poolOptions: {
      forks: { execArgv: ['--no-experimental-webstorage'] },
      threads: { execArgv: ['--no-experimental-webstorage'] },
    },
    coverage: {
      provider: 'v8',
      include: ['src/scoring/**', 'src/model/**'],
    },
  },
});
