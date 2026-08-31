import { useEffect, useRef } from 'react'
import { Layout } from './Layout'
import { NavProvider } from './nav'
import { applyHead, headForRoute } from './seo'
import { resolveRoute, type SiteRoute } from './routes'
import { HomePage } from './pages/Home'
import { ServicesPage } from './pages/Services'
import { ServiceDetailPage } from './pages/ServiceDetail'
import { TeamPage } from './pages/Team'
import { TestimonialsPage } from './pages/Testimonials'
import { ContactPage } from './pages/Contact'
import { NotFoundPage } from './pages/NotFound'

/* ---------------------------------------------------------------------------
   The public website. Rendered twice for every page: once at build time into a
   static HTML file, and once in the browser that hydrates it. Both go through
   this component with the same path, which is what keeps the two identical.
   --------------------------------------------------------------------------- */

function pageFor(route: SiteRoute) {
  switch (route.kind) {
    case 'home':
      return <HomePage />
    case 'services':
      return <ServicesPage />
    case 'service':
      return <ServiceDetailPage service={route.service} />
    case 'team':
      return <TeamPage />
    case 'testimonials':
      return <TestimonialsPage />
    case 'contact':
      return <ContactPage />
    case 'not-found':
      return <NotFoundPage />
  }
}

export function SiteApp({
  path,
  navigate,
}: {
  path: string
  navigate: (path: string, replace?: boolean) => void
}) {
  const route = resolveRoute(path)

  useEffect(() => {
    applyHead(headForRoute(route))
    // The head is a function of the address, so the address is the dependency.
    // `route` is rebuilt on every render and would re-run this forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])

  useNavigationSideEffects(path)

  return (
    <NavProvider value={{ path, navigate }}>
      <Layout>{pageFor(route)}</Layout>
    </NavProvider>
  )
}

/**
 * What a real page load does for free and a client-side navigation does not:
 * put the visitor at the top of the new page, and move focus out of the link
 * they just clicked so that the next Tab starts from the new content rather
 * than from wherever the old page's navigation had got to.
 *
 * Skipped on first render — an entry from a search result may carry a fragment,
 * and scrolling away from it would undo the browser's own work.
 */
function useNavigationSideEffects(path: string): void {
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [path])
}
