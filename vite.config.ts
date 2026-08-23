// `defineConfig` comes from vitest/config, not vite: it is vite's own, widened
// to accept the `test` block below. Up to vitest 3 a `/// <reference
// types="vitest" />` triple-slash directive augmented vite's `UserConfig`
// globally and importing from 'vite' was enough; vitest 4 dropped that
// augmentation, so the directive left `test` an unknown property and only the
// type-check caught it — the tests themselves ran either way.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import type { ProxyOptions } from 'vite'

// The board's API reflects CORS headers on reads, but it screens Origin on
// writes and answers `/result` for its own origin only (plus, as it happens,
// http://localhost:5173). So the proxy is not a convenience here — it is the
// only thing that makes searches work off the board's domain, and it keeps the
// app talking to a same-origin `/api/public` in development exactly as it does
// in production.
const UPSTREAM = process.env.BTEB_UPSTREAM ?? 'https://result.bteb.gov.bd'

const proxy: Record<string, ProxyOptions> = {
  '/api/public': {
    target: UPSTREAM,
    // Rewrites the Host header. It does NOT touch Origin, which is the one the
    // board actually screens on — hence the rewrite below.
    changeOrigin: true,
    secure: true,
    configure: (p) => {
      p.on('proxyReq', (proxyReq) => {
        // The board screens Origin on writes: it answers `/result` only for
        // its own origin and for http://localhost:5173, and returns a bare
        // 403 "Invalid CORS request" to anything else. A browser sends Origin
        // on every POST, same-origin included, and a proxy forwards it
        // untouched — so `npm run preview`, which serves on :4173, had its
        // searches rejected while the dev server on :5173 worked purely
        // because that one port happens to be allowlisted upstream.
        //
        // Presenting the upstream's own origin makes the local port
        // irrelevant: dev, preview and any --port a contributor picks all
        // behave the same, and the request matches what the deployed app
        // sends from the board's own domain.
        proxyReq.setHeader('origin', UPSTREAM)
      })
    },
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  // `npm run preview` serves the real bundle, so it needs the same proxy to be
  // a faithful rehearsal of production rather than a build with a dead API.
  // That is only true with the Origin rewrite above; without it preview could
  // read the catalogue but every search came back 403.
  preview: { proxy },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
