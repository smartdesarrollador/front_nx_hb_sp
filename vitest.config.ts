import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    passWithNoTests: true,
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 65, functions: 50, branches: 55, statements: 65 },
      exclude: [
        'node_modules/',
        '.next/',
        'test/',
        '**/*.d.ts',
        '**/__tests__/**',
        'app/**/*.tsx',
        'app/**/*.ts',
        'middleware.ts',
        'features/**/*PageClient.tsx',
        'features/**/types.ts',
        'features/**/components/**',
        'lib/queryClient.ts',
        'hooks/useFeatureGate.ts',
      ],
    },
  },
  define: {
    'process.env.NEXT_PUBLIC_API_URL': JSON.stringify('http://localhost:8000'),
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
