import { useEffect, useState } from 'react'

export const SEARCH_PATH = '/result-search'
export const RESULT_PATH = '/result-search/result'

/**
 * No routing library. This tracks `location.pathname` and pushes to it, which
 * is all the navigation there is — the pages themselves are decided by
 * the two predicates below and by `src/site/routes.ts`.
 */
export function usePath(): [string, (path: string, replace?: boolean) => void] {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = (next: string, replace = false) => {
    if (replace) window.history.replaceState(null, '', next)
    else window.history.pushState(null, '', next)
    setPath(next)
  }

  return [path, navigate]
}

function trimmed(path: string): string {
  return path.replace(/\/+$/, '')
}

export function isResultPath(path: string): boolean {
  return trimmed(path) === RESULT_PATH
}

export function isSearchPath(path: string): boolean {
  return trimmed(path) === SEARCH_PATH
}
