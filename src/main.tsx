import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

// Loaded here, in cascade order, and nowhere else. Importing a stylesheet from
// the component that uses it reads well but does not survive bundling: those
// imports are hoisted above this file's own, so the base sheet would land last
// and its generic rules would override the specific ones meant to refine them.
import './styles/base.css'
import './styles/search.css'
import './styles/result.css'
import './styles/site.css'

import { App } from './App'
import { normalizePath } from './site/routes'

const container = document.getElementById('root')!

const tree = (
  <StrictMode>
    <App />
  </StrictMode>
)

/**
 * Website pages are prerendered to static HTML at build time, so React attaches
 * to markup that is already there. The result portal is not — it is a form over
 * a live API with nothing to say before it has asked — so there the root is
 * empty and React renders from scratch.
 *
 * `data-prerendered` names the address the markup was rendered for. It is
 * checked rather than trusted: a host that falls back to `index.html` for an
 * unknown path serves the home page's markup at an address that is not the home
 * page, and hydrating that would graft one page's tree onto another's. When
 * they disagree the markup is thrown away and the page is rendered fresh.
 */
const prerendered = container.dataset.prerendered

if (prerendered && normalizePath(prerendered) === normalizePath(window.location.pathname)) {
  hydrateRoot(container, tree)
} else {
  container.replaceChildren()
  createRoot(container).render(tree)
}
