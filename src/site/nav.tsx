import { createContext, useContext, type ReactNode } from 'react'
import { normalizePath } from './routes'

/* ---------------------------------------------------------------------------
   Internal links.

   The site is prerendered to real HTML files, so every link is a real `<a>`
   with a real `href` — that is what a crawler follows, what "open in new tab"
   needs, and what makes the site work with JavaScript switched off. The click
   handler only intercepts the plain left-click, and hands everything else back
   to the browser.
   --------------------------------------------------------------------------- */

export interface Navigation {
  path: string
  navigate: (path: string) => void
}

const NavContext = createContext<Navigation>({
  path: '/',
  // The prerenderer renders pages that nobody clicks. A navigation that does
  // nothing is the correct behaviour there, not an error.
  navigate: () => {},
})

export function NavProvider({ value, children }: { value: Navigation; children: ReactNode }) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function useNavigation(): Navigation {
  return useContext(NavContext)
}

interface LinkProps {
  to: string
  children: ReactNode
  className?: string
  /** Applied in addition to `className` when `to` is the current page. */
  activeClassName?: string
  'aria-label'?: string
  onNavigate?: () => void
}

function isModified(e: React.MouseEvent): boolean {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0
}

export function Link({
  to,
  children,
  className,
  activeClassName,
  onNavigate,
  ...rest
}: LinkProps) {
  const { path, navigate } = useNavigation()
  const active = normalizePath(path) === normalizePath(to)

  const classes = [className, active && activeClassName].filter(Boolean).join(' ')

  return (
    <a
      href={to}
      className={classes || undefined}
      aria-current={active ? 'page' : undefined}
      onClick={(e) => {
        if (isModified(e)) return
        e.preventDefault()
        navigate(to)
        onNavigate?.()
      }}
      {...rest}
    >
      {children}
    </a>
  )
}

/** An address off this site: always a real link, never intercepted. */
export function ExternalLink({
  href,
  children,
  className,
  ...rest
}: {
  href: string
  children: ReactNode
  className?: string
  'aria-label'?: string
}) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </a>
  )
}
