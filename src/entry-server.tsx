import { renderToString } from 'react-dom/server'
import { SiteApp } from './site/SiteApp'
import { headForRoute, renderHeadTags } from './site/seo'
import { resolveRoute } from './site/routes'

// Loaded so that the SSR bundle pulls the same stylesheets into the graph the
// client build does; the CSS itself is emitted by the client build and linked
// from the template the prerenderer fills in.
import './styles/base.css'
import './styles/site.css'

export { indexablePaths } from './site/routes'
export { SITE } from './site/content'

export interface RenderedPage {
  /** Tags to place inside `<head>`. */
  head: string
  /** Markup to place inside `<div id="root">`. */
  html: string
}

/**
 * Renders one page to static markup. `navigate` is a no-op here: nothing is
 * clicked during a build, and every link is a real `href` regardless.
 */
export function renderPage(path: string): RenderedPage {
  const route = resolveRoute(path)
  return {
    head: renderHeadTags(headForRoute(route)),
    html: renderToString(<SiteApp path={path} navigate={() => {}} />),
  }
}
