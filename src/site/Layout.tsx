import { useEffect, useState, type ReactNode } from 'react'
import { SERVICES, SITE } from './content'
import { ExternalLink, Link, useNavigation } from './nav'
import { isCurrent, NAV, servicePath } from './routes'
import { SEARCH_PATH } from '../router'

/* ---------------------------------------------------------------------------
   The frame every page sits in: a skip link, the masthead and navigation, the
   page, and the footer.
   --------------------------------------------------------------------------- */

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="site-main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}

function Wordmark() {
  return (
    <Link to="/" className="wordmark" aria-label={`${SITE.name} — home`}>
      <span className="wordmark-badge" aria-hidden="true">
        {initials(SITE.name)}
      </span>
      <span className="wordmark-text">
        <span className="wordmark-name">{SITE.name}</span>
        <span className="wordmark-tagline">{SITE.tagline}</span>
      </span>
    </Link>
  )
}

function SiteHeader() {
  const { path } = useNavigation()
  const [open, setOpen] = useState(false)

  // The menu is a page-level overlay on a phone, so leaving it open across a
  // navigation would hide the page the visitor just asked for.
  useEffect(() => setOpen(false), [path])

  // Escape closes it, which is the one keyboard convention every overlay is
  // expected to honour.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Wordmark />

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-label">{open ? 'Close' : 'Menu'}</span>
          <span className={`nav-toggle-bars${open ? ' is-open' : ''}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <nav
          id="site-nav"
          className={`site-nav${open ? ' is-open' : ''}`}
          aria-label="Primary"
        >
          <ul className="nav-list">
            {NAV.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link${isCurrent(item, path) ? ' is-current' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/contact" className="button button--primary nav-cta">
            Get in touch
          </Link>
        </nav>
      </div>
    </header>
  )
}

function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <p className="footer-name">{SITE.name}</p>
          <p className="footer-tagline">{SITE.description}</p>
          {SITE.social.length > 0 ? (
            <ul className="footer-social">
              {SITE.social.map((s) => (
                <li key={s.url}>
                  <ExternalLink href={s.url}>{s.label}</ExternalLink>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <nav className="footer-column" aria-label="Services">
          <h2 className="footer-heading">Services</h2>
          <ul>
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link to={servicePath(s.slug)}>{s.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer-column" aria-label="Pages">
          <h2 className="footer-heading">Site</h2>
          <ul>
            {NAV.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-column">
          <h2 className="footer-heading">Contact</h2>
          <ul>
            <li>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            {SITE.phone ? (
              <li>
                <a href={`tel:${SITE.phone.replace(/\s+/g, '')}`}>{SITE.phone}</a>
              </li>
            ) : null}
            {SITE.address ? <li>{SITE.address}</li> : null}
            {SITE.hours ? <li>{SITE.hours}</li> : null}
          </ul>
        </div>
      </div>

      <div className="site-footer-base">
        <p>
          © {year} {SITE.name}. Documents are issued by the institutions
          concerned; this is an independent support service and is not
          affiliated with any university, board or government body.
        </p>
        <p>
          <a href={SEARCH_PATH}>BTEB result search</a> — an unofficial client
          for the board’s public result API, hosted alongside this site.
        </p>
      </div>
    </footer>
  )
}

/** "Education Service 40" becomes "E4" — two characters, never more. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '—'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}
