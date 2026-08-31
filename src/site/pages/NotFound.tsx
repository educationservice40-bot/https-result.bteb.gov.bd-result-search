import { SERVICES } from '../content'
import { Link } from '../nav'
import { PageHeader, ServiceGrid } from '../pieces'

/**
 * Rendered for any unknown address, and prerendered once to `dist/404.html` for
 * hosts that serve one file for all of them — which is why it never names the
 * address it was reached at. That name would be wrong on every page but one.
 */
export function NotFoundPage() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="That page does not exist"
        lede="Nothing is published at this address. It may have been renamed, or the link that brought you here may be incomplete."
      >
        <p className="hero-actions">
          <Link to="/" className="button button--primary">
            Go to the home page
          </Link>
          <Link to="/contact" className="button button--outline">
            Contact us
          </Link>
        </p>
      </PageHeader>

      <section className="section section--tight">
        <div className="shell">
          <header className="section-head">
            <h2 className="section-title">You may have wanted one of these</h2>
          </header>
          <ServiceGrid services={SERVICES} />
        </div>
      </section>
    </>
  )
}
