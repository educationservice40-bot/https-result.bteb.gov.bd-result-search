import type { ReactNode } from 'react'
import type { Service } from './content'
import { ArrowIcon, CheckIcon, ExternalIcon, ServiceIcon } from './icons'
import { ExternalLink, Link } from './nav'
import { servicePath } from './routes'

/* Pieces shared by more than one page. ------------------------------------- */

export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string
  title: string
  lede?: string
  children?: ReactNode
}) {
  return (
    <header className="page-header">
      <div className="shell">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="page-title">{title}</h1>
        {lede ? <p className="page-lede">{lede}</p> : null}
        {children}
      </div>
    </header>
  )
}

export function Breadcrumbs({ trail }: { trail: Array<{ name: string; path?: string }> }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {trail.map((item) => (
          <li key={item.name}>
            {item.path ? <Link to={item.path}>{item.name}</Link> : <span>{item.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="service-card">
      <ServiceIcon name={service.icon} className="service-card-icon" />
      <h3 className="service-card-title">
        {/* The whole card is clickable through this link's overlay, but the
            link itself still wraps only the title, so a screen reader announces
            "University Certificates, link" rather than the entire card. */}
        <Link to={servicePath(service.slug)} className="service-card-link">
          {service.name}
        </Link>
      </h3>
      <p className="service-card-tagline">{service.tagline}</p>
      <p className="service-card-more">
        Details <ArrowIcon className="icon-inline" />
      </p>
    </article>
  )
}

export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <ul className="service-grid">
      {services.map((service) => (
        <li key={service.slug}>
          <ServiceCard service={service} />
        </li>
      ))}
    </ul>
  )
}

export function CheckList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={`check-list${className ? ` ${className}` : ''}`}>
      {items.map((item) => (
        <li key={item}>
          <CheckIcon className="check-icon" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * A Google Drive folder for one service — or an honest note that there is not
 * one yet. A button that leads nowhere is worse than no button.
 */
export function DriveLink({ service }: { service: Service }) {
  if (!service.driveUrl) {
    return (
      <p className="drive-empty">
        Documents for this service are not published yet. Ask us and we will send
        them to you directly.
      </p>
    )
  }

  return (
    <ExternalLink href={service.driveUrl} className="drive-link">
      <span className="drive-link-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
          <path d="M8.4 3h7.2l6 10.4-3.6 6.2H6L2.4 13.4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M8.4 3 2.4 13.4h7.2zM15.6 3l-3.6 6.3 3.6 6.3h6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="drive-link-text">
        <span className="drive-link-label">{service.driveLabel}</span>
        <span className="drive-link-meta">Opens in Google Drive</span>
      </span>
      <ExternalIcon className="drive-link-arrow" />
    </ExternalLink>
  )
}

export function CallToAction({
  title,
  body,
  primary = { label: 'Contact us', path: '/contact' },
  secondary,
}: {
  title: string
  body: string
  primary?: { label: string; path: string }
  secondary?: { label: string; path: string }
}) {
  return (
    <section className="cta">
      <div className="shell cta-inner">
        <div>
          <h2 className="cta-title">{title}</h2>
          <p className="cta-body">{body}</p>
        </div>
        <p className="cta-actions">
          <Link to={primary.path} className="button button--light">
            {primary.label}
          </Link>
          {secondary ? (
            <Link to={secondary.path} className="button button--ghost">
              {secondary.label}
            </Link>
          ) : null}
        </p>
      </div>
    </section>
  )
}
