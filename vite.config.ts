// `defineConfig` comes from vitest/config, not vite: it is vite's own, widened
// to accept the `test` block below. Up to vitest 3 a `/// <reference
// types="vitest" />` triple-slash directive augmented vite's `UserConfig`
// globally and importing from 'vite' was enough; vitest 4 dropped that
// augmentation, so the directive left `test` an unknown property and only the
// type-check caught it — the tests themselves ran either way.
import { defineConfig } from 'vitest/config'
import type { ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

// The app always talks to a same-origin `/api/public`: Vite proxies it in
// development and in `preview`, and a reverse proxy does in production, so
// nothing about the request shape changes between the two. Calling the board
// directly from the browser is not a working alternative for the lookup itself
// — see the note on `Origin` below.
const UPSTREAM = process.env.BTEB_UPSTREAM ?? 'https://result.bteb.gov.bd'

/**
 * `changeOrigin` rewrites the `Host` header but not `Origin`, and the board
 * rejects a `POST /result` whose `Origin` is anything other than its own with a
 * bare 403 — no CORS message, no body. A browser sends `Origin` on every
 * same-origin POST (it omits it only for GET and HEAD), so the lookup fails in
 * a browser while the identical request from curl succeeds. Rewriting it here
 * is the difference between a working portal and one that answers every search
 * with "the result could not be retrieved".
 *
 * Anything standing in front of this in production has to do the same — see
 * "The Origin header" in the README.
 */
const proxy: Record<string, ProxyOptions> = {
  '/api/public': {
    target: UPSTREAM,
    changeOrigin: true,
    secure: true,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('origin', UPSTREAM)
        proxyReq.setHeader('referer', `${UPSTREAM}/result-search`)
      })
    },
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
