import path from 'node:path';

import { defineConfig } from 'vitest/config';

// Unit tests for pure logic only; UI flows are covered by Playwright (*.test.ts).
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    include: ['src/**/*.unit.test.ts'],
    environment: 'node',
  },
});
