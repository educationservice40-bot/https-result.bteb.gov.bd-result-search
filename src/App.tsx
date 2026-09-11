import { useEffect } from 'react'
import { isResultPath, isSearchPath, usePath } from './router'
import { SearchPage } from './components/SearchPage'
import { ResultPage } from './components/ResultPage'
import { SiteApp } from './site/SiteApp'

const PORTAL_TITLE = 'Result Search — Bangladesh Technical Education Board'

/**
 * Two things live at this origin: the public website, which owns everything,
 * and the board's result portal, which owns `/result-search` and the result
 * sheet beneath it. They deliberately share no layout — the portal is dressed
 * as the government form it mirrors, and a business's own site must never be
 * mistaken for one.
 */
export function App() {
  const [path, navigate] = usePath()
  const portal = isResultPath(path) || isSearchPath(path)

  // The website sets its own head from `site/seo.ts` on every navigation. The
  // portal's two pages are not prerendered and have no head of their own, so
  // the one title they share is set here rather than left as the site's.
  useEffect(() => {
    if (portal) document.title = PORTAL_TITLE
  }, [portal])

  if (isResultPath(path)) return <ResultPage navigate={navigate} />
  if (isSearchPath(path)) return <SearchPage navigate={navigate} />
  return <SiteApp path={path} navigate={navigate} />
}
