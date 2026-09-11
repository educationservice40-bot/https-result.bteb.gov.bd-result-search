import { SERVICES, type Service, serviceBySlug } from './content'

/* ---------------------------------------------------------------------------
   Every address the public site answers on, resolved without a routing
   library — the same choice the result portal already made next door.

   Resolution is a pure function of the path so that three very different
   callers can share it: the browser, the build-time prerenderer that writes one
   HTML file per page, and the sitemap generator in `vite.config.ts`.
   --------------------------------------------------------------------------- */

export type SiteRoute =
  | { kind: 'home' }
  | { kind: 'services' }
  | { kind: 'service'; service: Service }
  | { kind: 'team' }
  | { kind: 'testimonials' }
  | { kind: 'contact' }
  | { kind: 'not-found'; path: string }

export const SERVICES_PATH = '/services'

export function servicePath(slug: string): string {
  return `${SERVICES_PATH}/${slug}`
}

/**
 * `/Services/`, `/services` and `//services//` are one page, not three. Search
 * engines treat differing paths as differing URLs and split a page's standing
 * between them, so the variants collapse here and the canonical link in the
 * head always names the collapsed form.
 */
export function normalizePath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0]
  const collapsed = withoutQuery.replace(/\/{2,}/g, '/').replace(/\/+$/, '')
  return (collapsed || '/').toLowerCase()
}

const STATIC_ROUTES: Record<string, SiteRoute> = {
  '/': { kind: 'home' },
  '/services': { kind: 'services' },
  '/team': { kind: 'team' },
  '/testimonials': { kind: 'testimonials' },
  '/contact': { kind: 'contact' },
}

export function resolveRoute(path: string): SiteRoute {
  const normalized = normalizePath(path)

  const staticRoute = STATIC_ROUTES[normalized]
  if (staticRoute) return staticRoute

  const serviceSlug = normalized.startsWith(`${SERVICES_PATH}/`)
    ? normalized.slice(SERVICES_PATH.length + 1)
    : ''
  if (serviceSlug && !serviceSlug.includes('/')) {
    const service = serviceBySlug(serviceSlug)
    if (service) return { kind: 'service', service }
  }

  return { kind: 'not-found', path: normalized }
}

/** The canonical address of a resolved route. */
export function routePath(route: SiteRoute): string {
  switch (route.kind) {
    case 'home':
      return '/'
    case 'services':
      return SERVICES_PATH
    case 'service':
      return servicePath(route.service.slug)
    case 'team':
      return '/team'
    case 'testimonials':
      return '/testimonials'
    case 'contact':
      return '/contact'
    case 'not-found':
      return route.path
  }
}

/**
 * Every page worth prerendering and listing in the sitemap. The 404 is
 * deliberately absent from both: it has no canonical address to give.
 */
export function indexablePaths(): string[] {
  return [
    '/',
    SERVICES_PATH,
    ...SERVICES.map((s) => servicePath(s.slug)),
    '/team',
    '/testimonials',
    '/contact',
  ]
}

/* Navigation --------------------------------------------------------------- */

export interface NavItem {
  label: string
  path: string
}

export const NAV: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: SERVICES_PATH },
  { label: 'Team', path: '/team' },
  { label: 'Testimonials', path: '/testimonials' },
  { label: 'Contact', path: '/contact' },
]

/**
 * Whether a navigation item should be marked as the current page. Home matches
 * only itself; everything else also owns the pages beneath it, so a service
 * page keeps "Services" lit rather than leaving the bar with nothing current.
 */
export function isCurrent(item: NavItem, path: string): boolean {
  const here = normalizePath(path)
  if (item.path === '/') return here === '/'
  return here === item.path || here.startsWith(`${item.path}/`)
}
