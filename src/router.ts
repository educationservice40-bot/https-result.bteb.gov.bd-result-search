import { useEffect, useState } from 'react'

export const SEARCH_PATH = '/result-search'
export const RESULT_PATH = '/result-search/result'

/**
 * A two-page app does not need a routing library. This tracks
 * `location.pathname` and pushes to it, which is all the navigation there is.
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

export function isResultPath(path: string): boolean {
  return path.replace(/\/+$/, '') === RESULT_PATH
}
