import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@tests': '/tests',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // split the big third-party libs into their own chunks so the main
          // bundle doesn't blow past Rollup's 500kB warning threshold
          vendor: ['react', 'react-dom', 'react-router-dom'],
          leaflet: ['leaflet', 'react-leaflet'],
          recharts: ['recharts'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: [
      'tests/unit/**/*.test.{js,jsx}',
      'tests/integration/**/*.test.{js,jsx}',
      'tests/regression/**/*.test.{js,jsx}',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
