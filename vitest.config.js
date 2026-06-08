import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['resources/js/__tests__/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      reportsDirectory: './coverage',
      include: ['resources/js/**/*.{js,jsx}'],
      exclude: [
        'resources/js/__tests__/**',
        'resources/js/bootstrap.js',
      ],
    },
  },
});
