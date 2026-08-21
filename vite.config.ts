/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The board's public API sets permissive CORS headers, so the browser can call
// it cross-origin. The dev proxy is still the default path: it keeps the app
// talking to a same-origin `/api/public` in development exactly as it does in
// production behind a reverse proxy, so nothing about the request shape
// changes between the two.
const UPSTREAM = process.env.BTEB_UPSTREAM ?? 'https://result.bteb.gov.bd'

const proxy = {
  '/api/public': {
    target: UPSTREAM,
    changeOrigin: true,
    secure: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  // `npm run preview` serves the real bundle, so it needs the same proxy to be
  // a faithful rehearsal of production rather than a build with a dead API.
  preview: { proxy },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
